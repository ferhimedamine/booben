'use strict';

//noinspection JSUnresolvedVariable
import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  type: PropTypes.oneOf(['main', 'secondary']),
};

const defaultProps = {
  type: 'main',
};

export const BlockContentActionsRegion = props => {
  const className = `block-content-actions-region region-${props.type}`;

  return (
    <div className={className}>
      {props.children}
    </div>
  );
};

BlockContentActionsRegion.propTypes = propTypes;
BlockContentActionsRegion.defaultProps = defaultProps;
BlockContentActionsRegion.displayName = 'BlockContentActionsRegion';
