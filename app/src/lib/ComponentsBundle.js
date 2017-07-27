/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import _mapValues from 'lodash.mapvalues';
import patchComponent from '../hocs/patchComponent';
import { parseComponentName } from './meta';
import { COMPONENTS_BUNDLE_FILE } from '../config';
import { URL_BUNDLE_PREFIX } from '../../../shared/constants';

const scriptsCache = {};

/**
 *
 * @param {string} url
 * @return {Promise<string>}
 */
const loadScript = async url => {
  const cached = scriptsCache[url];
  if (cached) return cached;
  
  const res = await fetch(url);
  const script = await res.text();
  
  scriptsCache[url] = script;
  return script;
};

/**
 *
 * @param {Window} windowInstance
 * @param {string} url
 * @return {Promise<void>}
 */
const loadComponentsBundleIntoWindow = async (windowInstance, url) => {
  const document = windowInstance.document;
  const script = document.createElement('script');
  
  script.type = 'application/javascript';
  document.body.appendChild(script);
  script.text = await loadScript(url);
};

export default class ComponentsBundle {
  constructor(projectName, windowInstance) {
    this._windowInstance = windowInstance;
    this._projectName = projectName;
    this._loading = false;
    this._loaded = false;
    this._components = null;
  }

  /**
   *
   * @return {Promise<void>}
   */
  async loadComponents() {
    if (this._loaded) {
      throw new Error(
        'ComponentsBundle#loadComponents(): components already loaded',
      );
    }

    if (this._loading) {
      throw new Error(
        'ComponentsBundle#loadComponents(): components already loading',
      );
    }

    this._loading = true;

    // These modules are external in the components bundle
    this._windowInstance.React = React;
    this._windowInstance.ReactDOM = ReactDOM;
    this._windowInstance.PropTypes = PropTypes;

    await loadComponentsBundleIntoWindow(
      this._windowInstance,
      `${URL_BUNDLE_PREFIX}/${this._projectName}/${COMPONENTS_BUNDLE_FILE}`,
    );

    const noComponents =
      !this._windowInstance.JssyComponents ||
      !this._windowInstance.JssyComponents.default;

    if (noComponents) {
      throw new Error(
        'ComponentsBundle#loadComponents(): No components in bundle',
      );
    }

    this._components = _mapValues(
      this._windowInstance.JssyComponents.default,
      ns => _mapValues(ns, patchComponent),
    );

    this._loading = false;
    this._loaded = true;
  }

  /**
   *
   * @param {string} componentName
   * @return {string|Function}
   */
  getComponentByName(componentName) {
    if (!this._loaded) {
      throw new Error(
        'ComponentsBundle#getComponentByName: components not loaded',
      );
    }

    const { namespace, name } = parseComponentName(componentName);

    if (!namespace || !name) {
      throw new Error(
        'ComponentsBundle#getComponentByName: ' +
        `Invalid component name: '${componentName}'`,
        );
    }

    if (namespace === 'HTML') return name;

    if (!this._components[namespace]) {
      throw new Error(
        'ComponentsBundle#getComponentByName: ' +
        `Namespace not found: '${namespace}'`,
        );
    }

    const component = this._components[namespace][name];

    if (!component) {
      throw new Error(
        'ComponentsBundle#getComponentByName: ' +
        `Component not found: '${componentName}'`,
        );
    }

    return component;
  }
}
