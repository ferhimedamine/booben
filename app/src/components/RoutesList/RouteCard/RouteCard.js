import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTooltip } from 'reactackle-tooltip';
import ProjectRoute from '../../../models/ProjectRoute';
import { noop } from '../../../utils/misc';
import { RouteCardStyled } from './styles/RouteCardStyled';
import { CardWrapperStyled } from './styles/CardWrapperStyled';
import { CardStyled } from './styles/CardStyled';
import { CardContentStyled } from './styles/CardContentStyled';
import { TitleBoxStyled } from './styles/TitleBoxStyled';
import { TitleStyled } from './styles/TitleStyled';
import { SubtitleStyled } from './styles/SubtitleStyled';
import { MarkWrapperStyled } from './styles/MarkWrapperStyled';
import { IconMarkStyled } from './styles/IconMarkStyled';
import { AlertMarkStyled } from './styles/AlertMarkStyled';
import { TextBoxStyled } from './styles/TextBoxStyled';
import { MessageStyled } from './styles/MessageStyled';
import { IconRedirect, IconExclamation } from '../../icons';

const propTypes = {
  route: PropTypes.instanceOf(ProjectRoute).isRequired,
  focused: PropTypes.bool,
  disabled: PropTypes.bool,
  alertMark: PropTypes.bool,
  alertTooltip: PropTypes.string,
  message: PropTypes.node,
  messageColorScheme: PropTypes.oneOf(['neutral', 'error']),
  Tooltip: PropTypes.func.isRequired,
  showTooltip: PropTypes.func.isRequired,
  hideTooltip: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  onGo: PropTypes.func,
};

const defaultProps = {
  focused: false,
  disabled: false,
  alertMark: false,
  alertTooltip: '',
  message: null,
  messageColorScheme: 'neutral',
  onFocus: noop,
  onGo: noop,
};

class _RouteCard extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this._element = null;
    this._handleDoubleClick = this._handleDoubleClick.bind(this);
    this._handleCardClick = this._handleCardClick.bind(this);
    this._saveRef = this._saveRef.bind(this);
  }

  componentDidMount() {
    this._element.addEventListener('dblclick', this._handleDoubleClick);
  }

  componentWillUpdate(nextProps) {
    const { onGo } = this.props;

    if (nextProps.onGo !== onGo) {
      this._element.removeEventListener('dblclick', this._handleDoubleClick);
    }
  }

  componentDidUpdate(prevProps) {
    const { onGo } = this.props;

    if (prevProps.onGo !== onGo) {
      this._element.addEventListener('dblclick', this._handleDoubleClick);
    }
  }

  componentWillUnmount() {
    this._element.removeEventListener('dblclick', this._handleDoubleClick);
  }

  _handleDoubleClick() {
    const { route, disabled, onGo } = this.props;

    if (!disabled) {
      onGo({ routeId: route.id, isIndexRoute: false });
    }
  }

  _handleCardClick() {
    const { route, onFocus } = this.props;
    onFocus({ routeId: route.id, isIndexRoute: false });
  }

  _saveRef(el) {
    this._element = el;
  }

  render() {
    const {
      route,
      focused,
      children,
      alertMark,
      alertTooltip,
      message,
      messageColorScheme,
      Tooltip,
      showTooltip,
      hideTooltip,

    } = this.props;

    let redirectMark = null;
    if (route.redirect) {
      redirectMark = (
        <IconMarkStyled>
          <IconRedirect />
        </IconMarkStyled>
      );
    }

    let mark = null;
    if (alertMark) {
      mark = (
        <AlertMarkStyled onMouseEnter={showTooltip} onMouseOut={hideTooltip}>
          <IconExclamation />
          <Tooltip text={alertTooltip} />
        </AlertMarkStyled>
      );
    }

    let markWrapper = null;
    if (mark || redirectMark) {
      markWrapper = (
        <MarkWrapperStyled>
          {mark}
          {redirectMark}
        </MarkWrapperStyled>
      );
    }

    let messageElement = null;
    if (message) {
      messageElement = (
        <MessageStyled colorScheme={messageColorScheme}>
          {message}
        </MessageStyled>
      );
    }

    const title = route.title || route.path;

    return (
      <RouteCardStyled>
        <CardWrapperStyled focused={focused}>
          <CardStyled
            focused={focused}
            tabIndex="0"
            onClick={this._handleCardClick}
            innerRef={this._saveRef}
          >
            <CardContentStyled focused={focused}>
              <TextBoxStyled>
                <TitleBoxStyled>
                  <TitleStyled>{title}</TitleStyled>
                </TitleBoxStyled>

                <SubtitleStyled>
                  {route.path}
                </SubtitleStyled>
              </TextBoxStyled>

              {markWrapper}
            </CardContentStyled>

            {messageElement}
          </CardStyled>
        </CardWrapperStyled>

        {children}
      </RouteCardStyled>
    );
  }
}

_RouteCard.propTypes = propTypes;
_RouteCard.defaultProps = defaultProps;
_RouteCard.displayName = 'RouteCard';

export const RouteCard = withTooltip(_RouteCard);
