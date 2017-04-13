/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@reactackle/reactackle';
import { noop } from '../../../../utils/misc';

const propTypes = {
  id: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  onPress: PropTypes.func,
};

const defaultProps = {
  onPress: noop,
};

export const PropAction = ({ id, icon, onPress }) => (
  <div className={`prop_action prop_action-${id}`}>
    <Button icon={icon} onPress={onPress} />
  </div>
);

PropAction.propTypes = propTypes;
PropAction.defaultProps = defaultProps;
PropAction.displayName = 'PropAction';
