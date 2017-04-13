'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import './FunctionEditor.scss';
import { noop } from '../../utils/misc';

const propTypes = {
  name: PropTypes.string,
  args: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
  })),
  code: PropTypes.string,
  onChange: PropTypes.func,
};

const defaultProps = {
  name: '',
  args: [],
  code: '',
  onChange: noop,
};

export const FunctionEditor = ({ name, args, code, onChange }) => {
  const header = `function ${name}(${args.map(arg => arg.name).join(', ')}) {`;
  const footer = '}';
  
  const codeMirrorOptions = {
    mode: 'javascript',
    lineNumbers: true,
  };

  return (
    <div className="function-editor">
      <div className="function-editor_heading">
        <pre>
          {header}
        </pre>
      </div>

      <div className="function-editor_wrapper">
        <CodeMirror
          value={code}
          options={codeMirrorOptions}
          preserveScrollPosition
          onChange={onChange}
        />
      </div>

      <div className="function-editor_heading">
        <pre>
          {footer}
        </pre>
      </div>
    </div>
  );
};

FunctionEditor.propTypes = propTypes;
FunctionEditor.defaultProps = defaultProps;
FunctionEditor.displayName = 'FunctionEditor';
