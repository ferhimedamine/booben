/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { getNestedTypedef } from '@jssy/types';
import { PropsList } from '../../components/PropsList/PropsList';
import { JssyValueEditor } from '../JssyValueEditor/JssyValueEditor';

import {
  BlockContentBox,
  BlockContentBoxHeading,
  BlockContentBoxItem,
  BlockContentPlaceholder,
} from '../../components/BlockContent/BlockContent';

import ProjectComponentRecord from '../../models/ProjectComponent';

import {
  replaceJssyValue,
  constructComponentForProp,
  linkDialogOpen,
} from '../../actions/project';

import { PathStartingPoints } from '../../reducers/project';

import {
  currentComponentsSelector,
  currentSelectedComponentIdsSelector,
  topNestedConstructorSelector,
} from '../../selectors';

import {
  getString,
  getComponentMeta,
  isValidSourceForValue,
  parseComponentName,
  formatComponentName,
  constructComponent,
} from '../../utils/meta';

import { SYSTEM_PROPS } from '../../constants/misc';
import { getLocalizedTextFromState } from '../../utils';

//noinspection JSUnresolvedVariable
const propTypes = {
  meta: PropTypes.object.isRequired,
  components: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectComponentRecord),
    PropTypes.number,
  ).isRequired,
  selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number).isRequired,
  language: PropTypes.string.isRequired,
  ownerProps: PropTypes.object,
  ownerUserTypedefs: PropTypes.object,
  getLocalizedText: PropTypes.func.isRequired,
  onReplacePropValue: PropTypes.func.isRequired,
  onConstructComponent: PropTypes.func.isRequired,
  onLinkProp: PropTypes.func.isRequired,
};

const defaultProps = {
  ownerProps: null,
  ownerUserTypedefs: null,
};

const ownerPropsSelector = createSelector(
  topNestedConstructorSelector,
  
  topNestedConstructor => {
    if (!topNestedConstructor) return null;
    
    const ownerComponentPropMeta = topNestedConstructor.valueInfo.valueDef;
    
    return ownerComponentPropMeta.source.indexOf('designer') > -1
      ? ownerComponentPropMeta.sourceConfigs.designer.props || null
      : null;
  },
);

const ownerUserTypedefsSelector = createSelector(
  topNestedConstructorSelector,
  
  topNestedConstructor => {
    if (!topNestedConstructor) return null;
    return topNestedConstructor.valueInfo.userTypedefs;
  },
);

const mapStateToProps = state => ({
  meta: state.project.meta,
  components: currentComponentsSelector(state),
  selectedComponentIds: currentSelectedComponentIdsSelector(state),
  language: state.app.language,
  ownerProps: ownerPropsSelector(state),
  ownerUserTypedefs: ownerUserTypedefsSelector(state),
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onReplacePropValue: (path, newValue) =>
    void dispatch(replaceJssyValue(path, newValue)),
  
  onConstructComponent: (path, components, rootId) =>
    void dispatch(constructComponentForProp(path, components, rootId)),
  
  onLinkProp: path => void dispatch(linkDialogOpen(path)),
});

/**
 *
 * @param {Object} propMeta
 * @return {boolean}
 */
const isRenderableProp = propMeta =>
  isValidSourceForValue(propMeta, 'static') ||
  isValidSourceForValue(propMeta, 'state') ||
  isValidSourceForValue(propMeta, 'function') ||
  isValidSourceForValue(propMeta, 'data') || (
    propMeta.type === 'component' &&
    isValidSourceForValue(propMeta, 'designer')
  );

/**
 *
 * @param {number} componentId
 * @param {boolean} isSystemProp
 * @param {string} propName
 * @param {(string|number)[]} [path=[]]
 * @return {Path}
 */
const buildFullPath = (componentId, isSystemProp, propName, path = []) => ({
  startingPoint: PathStartingPoints.CURRENT_COMPONENTS,
  steps: [
    componentId,
    isSystemProp ? 'systemProps' : 'props',
    propName,
    ...path,
  ],
});

class ComponentPropsEditorComponent extends PureComponent {
  constructor(props) {
    super(props);
  
    this._handleSystemPropSetComponent =
      this._handleSetComponent.bind(this, true);
    this._handleSystemPropChange = this._handleChange.bind(this, true);
    this._handleSystemPropLink = this._handleLink.bind(this, true);
  
    this._handleSetComponent = this._handleSetComponent.bind(this, false);
    this._handleChange = this._handleChange.bind(this, false);
    this._handleLink = this._handleLink.bind(this, false);
  }
  
  /**
   *
   * @param {boolean} isSystemProp
   * @param {string} name
   * @param {*} value
   * @private
   */
  _handleChange(isSystemProp, { name, value }) {
    const { selectedComponentIds, onReplacePropValue } = this.props;
    
    const componentId = selectedComponentIds.first();
    const fullPath = buildFullPath(componentId, isSystemProp, name);
    onReplacePropValue(fullPath, value);
  }
  
  /**
   *
   * @param {boolean} isSystemProp
   * @param {string} name
   * @param {(string|number)[]} path
   * @private
   */
  _handleLink(isSystemProp, { name, path }) {
    const { selectedComponentIds, onLinkProp } = this.props;
    
    const componentId = selectedComponentIds.first();
    const fullPath = buildFullPath(componentId, isSystemProp, name, path);
    onLinkProp(fullPath);
  }

  /**
   *
   * @param {boolean} isSystemProp
   * @param {string} name
   * @param {(string|number)[]} path
   * @private
   */
  _handleSetComponent(isSystemProp, { name, path }) {
    const {
      meta,
      components,
      selectedComponentIds,
      language,
      onConstructComponent,
    } = this.props;
    
    const componentId = selectedComponentIds.first();
    const component = components.get(componentId);
    const currentPropValue = isSystemProp
      ? component.systemProps.get(name)
      : component.props.get(name);
    
    const currentValue = currentPropValue.getInStatic(path);
    const componentMeta = getComponentMeta(component.name, meta);
    const valueMeta = getNestedTypedef(
      componentMeta.props[name],
      path,
      componentMeta.types,
    );
  
    let initialComponents = null;
    let initialComponentsRootId = -1;
    
    const willBuildWrapper =
      !currentValue.hasDesignedComponent() &&
      !!valueMeta.sourceConfigs.designer.wrapper;
    
    if (willBuildWrapper) {
      const { namespace } = parseComponentName(component.name);
  
      const wrapperFullName = formatComponentName(
        namespace,
        valueMeta.sourceConfigs.designer.wrapper,
      );
  
      initialComponents = constructComponent(
        wrapperFullName,
        valueMeta.sourceConfigs.designer.wrapperLayout || 0,
        language,
        meta,
        { isNew: false, isWrapper: true },
      );
  
      initialComponentsRootId = 0;
    }
    
    const fullPath = buildFullPath(componentId, isSystemProp, name, path);
    onConstructComponent(fullPath, initialComponents, initialComponentsRootId);
  }

  /**
   *
   * @param {ComponentMeta} componentMeta
   * @param {string} propName
   * @param {Object} propValue
   * @returns {?ReactElement}
   * @private
   */
  _renderPropsItem(componentMeta, propName, propValue) {
    const {
      ownerProps,
      ownerUserTypedefs,
      language,
      getLocalizedText,
    } = this.props;

    const propMeta = componentMeta.props[propName];
    
    return (
      <JssyValueEditor
        key={propName}
        name={propName}
        value={propValue}
        valueDef={propMeta}
        userTypedefs={componentMeta.types}
        strings={componentMeta.strings}
        language={language}
        ownerProps={ownerProps}
        ownerUserTypedefs={ownerUserTypedefs}
        getLocalizedText={getLocalizedText}
        onChange={this._handleChange}
        onLink={this._handleLink}
        onConstructComponent={this._handleSetComponent}
      />
    );
  }
  
  /**
   *
   * @param {Object} component
   * @return {ReactElement}
   * @private
   */
  _renderSystemProps(component) {
    const {
      ownerProps,
      ownerUserTypedefs,
      getLocalizedText,
    } = this.props;
    
    const visibleLabel =
      getLocalizedText('propsEditor.systemProps.visible.name');
    
    const visibleDesc =
      getLocalizedText('propsEditor.systemProps.visible.desc');
    
    //noinspection JSValidateTypes
    return (
      <BlockContentBoxItem key="__system_props__">
        <PropsList>
          <JssyValueEditor
            name="visible"
            value={component.systemProps.get('visible')}
            valueDef={SYSTEM_PROPS.visible}
            label={visibleLabel}
            description={visibleDesc}
            ownerProps={ownerProps}
            ownerUserTypedefs={ownerUserTypedefs}
            getLocalizedText={getLocalizedText}
            onChange={this._handleSystemPropChange}
            onLink={this._handleSystemPropLink}
            onConstructComponent={this._handleSystemPropSetComponent}
          />
        </PropsList>
      </BlockContentBoxItem>
    );
  }

  render() {
    const { selectedComponentIds, getLocalizedText } = this.props;

    if (selectedComponentIds.size === 0) {
      //noinspection JSCheckFunctionSignatures
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('selectAComponent')}
        />
      );
    }

    if (selectedComponentIds.size > 1) {
      //noinspection JSCheckFunctionSignatures
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('multipleComponentsSelected')}
        />
      );
    }

    const componentId = selectedComponentIds.first();
    const component = this.props.components.get(componentId);
    const componentMeta = getComponentMeta(component.name, this.props.meta);

    if (!componentMeta) return null;

    const propGroups = componentMeta.propGroups.map(groupData => ({
      name: groupData.name,
      title: getString(
        componentMeta.strings,
        groupData.textKey,
        this.props.language,
      ),
      props: [],
    }));

    const propsByGroup = new Map();
    propGroups.forEach(group => void propsByGroup.set(group.name, group.props));

    const propsWithoutGroup = [];
    const renderablePropNames = Object.keys(componentMeta.props)
      .filter(propName => isRenderableProp(componentMeta.props[propName]));

    if (renderablePropNames.length === 0) {
      //noinspection JSCheckFunctionSignatures
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('thisComponentDoesntHaveEditableAttributes')}
        />
      );
    }

    renderablePropNames.forEach(propName => {
      const propMeta = componentMeta.props[propName];
      if (propMeta.group) propsByGroup.get(propMeta.group).push(propName);
      else propsWithoutGroup.push(propName);
    });

    const content = [];

    propGroups.forEach(group => {
      content.push(
        <BlockContentBoxHeading key={`${group.name}__heading__`}>
          {group.title}
        </BlockContentBoxHeading>,
      );

      const controls = group.props.map(propName => this._renderPropsItem(
        componentMeta,
        propName,
        component.props.get(propName) || null,
      ));

      content.push(
        <BlockContentBoxItem key={group.name}>
          <PropsList>
            {controls}
          </PropsList>
        </BlockContentBoxItem>,
      );
    });

    if (propsWithoutGroup.length > 0) {
      const controls = propsWithoutGroup.map(propName => this._renderPropsItem(
        componentMeta,
        propName,
        component.props.get(propName) || null,
      ));

      content.push(
        <BlockContentBoxItem key="__no_group__">
          <PropsList>
            {controls}
          </PropsList>
        </BlockContentBoxItem>,
      );
    }
    
    const systemProps = this._renderSystemProps(component);

    return (
      <BlockContentBox isBordered>
        {systemProps}
        {content}
      </BlockContentBox>
    );
  }
}

ComponentPropsEditorComponent.propTypes = propTypes;
ComponentPropsEditorComponent.defaultProps = defaultProps;
ComponentPropsEditorComponent.dispalyName = 'ComponentPropsEditor';

export const ComponentPropsEditor = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ComponentPropsEditorComponent);
