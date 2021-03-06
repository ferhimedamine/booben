import styled, { css } from 'styled-components';
import constants from '../../../styles/constants';

const colorScheme = ({ active }) => active
  ? css`
    &,
    &:hover,
    &:focus {
      background-color: ${constants.actions.action.activeBgColor};
      opacity: 1;
    }
  `
  : `
    background-color: ${constants.actions.action.bgColor};
    opacity: 0.54;

    &:hover,
    &:focus {
        opacity: 0.9;
    }
  `;

export const PageDrawerActionItemStyled = styled.div`
  display: flex;
  flex-shrink: 0;
  min-height: ${constants.actionHeight}px;
  ${colorScheme}
  
  & > * {
    flex-grow: 1;
    width: 100%;
    justify-content: center;
  }
      
  *,
  *:hover,
  *:focus {
    background-color: transparent;
  }
`;

PageDrawerActionItemStyled.displayName = 'PageDrawerActionItemStyled';
