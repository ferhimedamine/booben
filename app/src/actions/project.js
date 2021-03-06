import triggersProjectSave from './project-save/wrapper';
import { getProject, getMetadata, getGraphQLSchema } from '../lib/api';
import { URL_GRAPHQL_PREFIX } from '../../../shared/constants';
import fakeSchema from './helpers/fakeSchema.json';

export const PROJECT_REQUEST = 'PROJECT_REQUEST';
export const PROJECT_LOADED = 'PROJECT_LOADED';
export const PROJECT_LOAD_FAILED = 'PROJECT_LOAD_FAILED';

export const PROJECT_ROUTE_CREATE = 'PROJECT_ROUTE_CREATE';
export const PROJECT_ROUTE_DELETE = 'PROJECT_ROUTE_DELETE';
export const PROJECT_ROUTE_UPDATE_FIELD = 'PROJECT_ROUTE_UPDATE_FIELD';
export const PROJECT_ROUTE_UPDATE_PATH = 'PROJECT_ROUTE_UPDATE_PATH';

export const PROJECT_MOVE_CURSOR = 'PROJECT_MOVE_CURSOR';

export const PROJECT_COMPONENT_CREATE =
  'PROJECT_COMPONENT_CREATE';
export const PROJECT_COMPONENT_DELETE =
  'PROJECT_COMPONENT_DELETE';
export const PROJECT_COMPONENT_RENAME =
  'PROJECT_COMPONENT_RENAME';
export const PROJECT_COMPONENT_CHANGE_STYLE =
  'PROJECT_COMPONENT_CHANGE_STYLE';
export const PROJECT_COMPONENT_TOGGLE_REGION =
  'PROJECT_COMPONENT_TOGGLE_REGION';
export const PROJECT_COMPONENT_COPY =
  'PROJECT_COMPONENT_COPY';
export const PROJECT_COMPONENT_MOVE =
  'PROJECT_COMPONENT_MOVE';
export const PROJECT_COMPONENT_MOVE_TO_CLIPBOARD =
  'PROJECT_COMPONENT_MOVE_TO_CLIPBOARD';
export const PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT =
  'PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT';
export const PROJECT_COMPONENT_CONVERT_TO_LIST =
  'PROJECT_COMPONENT_CONVERT_TO_LIST';

export const PROJECT_CREATE_FUNCTION = 'PROJECT_CREATE_FUNCTION';

export const PROJECT_BOOBEN_VALUE_REPLACE =
  'PROJECT_BOOBEN_VALUE_REPLACE';
export const PROJECT_BOOBEN_VALUE_ADD_ACTION =
  'PROJECT_BOOBEN_VALUE_ADD_ACTION';
export const PROJECT_BOOBEN_VALUE_REPLACE_ACTION =
  'PROJECT_BOOBEN_VALUE_REPLACE_ACTION';
export const PROJECT_BOOBEN_VALUE_DELETE_ACTION =
  'PROJECT_BOOBEN_VALUE_DELETE_ACTION';
export const PROJECT_BOOBEN_VALUE_CONSTRUCT_COMPONENT =
  'PROJECT_BOOBEN_VALUE_CONSTRUCT_COMPONENT';
export const PROJECT_BOOBEN_VALUE_CONSTRUCT_COMPONENT_SAVE =
  'PROJECT_BOOBEN_VALUE_CONSTRUCT_COMPONENT_SAVE';
export const PROJECT_BOOBEN_VALUE_CONSTRUCT_COMPONENT_CANCEL =
  'PROJECT_BOOBEN_VALUE_CONSTRUCT_COMPONENT_CANCEL';

export const PROJECT_PICK_COMPONENT =
  'PROJECT_PICK_COMPONENT';
export const PROJECT_PICK_COMPONENT_DONE =
  'PROJECT_PICK_COMPONENT_DONE';
export const PROJECT_PICK_COMPONENT_CANCEL =
  'PROJECT_PICK_COMPONENT_CANCEL';
export const PROJECT_PICK_COMPONENT_DATA =
  'PROJECT_PICK_COMPONENT_DATA';
export const PROJECT_PICK_COMPONENT_DATA_CANCEL =
  'PROJECT_PICK_COMPONENT_DATA_CANCEL';

export const PROJECT_UNDO = 'PROJECT_UNDO';
export const PROJECT_REDO = 'PROJECT_REDO';

/**
 *
 * @param {string} projectName
 * @return {Object}
 */
const requestProject = projectName => ({
  type: PROJECT_REQUEST,
  projectName,
});

/**
 *
 * @param {Object} project
 * @param {Object} metadata
 * @param {Object} [schema=null]
 * @return {Object}
 */
const projectLoaded = (project, metadata, schema = null) => ({
  type: PROJECT_LOADED,
  project,
  metadata,
  schema,
});

/**
 *
 * @param {Object} error
 * @return {Object}
 */
const projectLoadFailed = error => ({
  type: PROJECT_LOAD_FAILED,
  error,
});

/**
 *
 * @param {string} projectName
 * @return {function(dispatch: function(action: Object))}
 */
export const loadProject = projectName => async dispatch => {
  dispatch(requestProject(projectName));

  try {
    const [project, metadata] = await Promise.all([
      getProject(projectName),
      getMetadata(projectName),
    ]);

    if (project.graphQLEndpointURL) {
      const graphQLEndpointURL = project.proxyGraphQLEndpoint
        ? `${URL_GRAPHQL_PREFIX}/${project.name}`
        : project.graphQLEndpointURL;

      const schema = await getGraphQLSchema(graphQLEndpointURL);

      dispatch(projectLoaded(project, metadata, schema));
    } else {
      dispatch(projectLoaded(project, metadata, fakeSchema));
    }
  } catch (error) {
    dispatch(projectLoadFailed(error));
  }
};

/**
 *
 * @param {number} parentRouteId - id of parent route (or -1 for root route)
 * @param {string} path
 * @param {string} title
 * @param {Object<string, string>} paramValues
 * @return {Object}
 */
export const createRoute = triggersProjectSave(
  (parentRouteId, path, title, paramValues) => ({
    type: PROJECT_ROUTE_CREATE,
    parentRouteId,
    path,
    title,
    paramValues,
  }),
);

/**
 *
 * @param {number} routeId
 * @return {Object}
 */
export const deleteRoute = triggersProjectSave(routeId => ({
  type: PROJECT_ROUTE_DELETE,
  routeId,
}));

/**
 *
 * @param {number} routeId
 * @param {string} field
 * @param {*} newValue
 * @return {Object}
 */
export const updateRouteField = triggersProjectSave(
  (routeId, field, newValue) => ({
    type: PROJECT_ROUTE_UPDATE_FIELD,
    routeId,
    field,
    newValue,
  }),
);

/**
 *
 * @param {number} routeId
 * @param {string} newPath
 * @param {Object<string, string>} newParamValues
 * @param {Object<string, string>} [renamedParams={}]
 */
export const updateRoutePath = triggersProjectSave((
  routeId,
  newPath,
  newParamValues,
  renamedParams = {},
) => ({
  type: PROJECT_ROUTE_UPDATE_PATH,
  routeId,
  newPath,
  newParamValues,
  renamedParams,
}));

/**
 *
 * @param {Immutable.Map<number, Object>}
 * @param {number} containerId
 * @param {number} afterIdx
 */
export const createComponent = triggersProjectSave(
  (components, containerId, afterIdx, updateCursorPosition = true) => ({
    type: PROJECT_COMPONENT_CREATE,
    components,
    containerId,
    afterIdx,
    updateCursorPosition,
  }),
);

/**
 *
 * @param {string} componentId - Component ID
 * @return {Object}
 */
export const deleteComponent = triggersProjectSave(componentId => ({
  type: PROJECT_COMPONENT_DELETE,
  componentId,
}));

/**
 *
 * @param {number} componentId
 * @param {number} containerId
 * @param {number} afterIdx
 * @return {Object}
 */
export const copyComponent = triggersProjectSave(
  (componentId, containerId, afterIdx) => ({
    type: PROJECT_COMPONENT_COPY,
    componentId,
    containerId,
    afterIdx,
  }),
);

/**
 *
 * @param {number} componentId
 * @param {number} containerId
 * @param {number} afterIdx
 * @param {boolean} [clearClipboard=false]
 * @return {Object}
 */
export const moveComponent = triggersProjectSave(
  (componentId, containerId, afterIdx, clearClipboard) => ({
    type: PROJECT_COMPONENT_MOVE,
    componentId,
    containerId,
    afterIdx,
    clearClipboard,
  }),
);

/**
 *
 * @param {number} componentId
 * @param {boolean} copy
 * @return {Object}
 */
export const moveComponentToClipboard = (componentId, copy) => ({
  type: PROJECT_COMPONENT_MOVE_TO_CLIPBOARD,
  componentId,
  copy,
});

/**
 *
 * @param {Path} path
 * @param {BoobenValue} newValue
 * @return {Object}
 */
export const replaceBoobenValue = triggersProjectSave((path, newValue) => ({
  type: PROJECT_BOOBEN_VALUE_REPLACE,
  path,
  newValue,
}));

/**
 *
 * @param {Path} path - Path to actions list
 * @param {Object} action
 * @return {Object}
 */
export const addAction = triggersProjectSave((path, action) => ({
  type: PROJECT_BOOBEN_VALUE_ADD_ACTION,
  path,
  action,
}));

/**
 *
 * @param {Path} path - Path to actions list
 * @param {number} index - Index in actions list
 * @param {Object} newAction
 * @return {Object}
 */
export const replaceAction = triggersProjectSave((path, index, newAction) => ({
  type: PROJECT_BOOBEN_VALUE_REPLACE_ACTION,
  path,
  index,
  newAction,
}));

/**
 *
 * @param {Path} path - Path to actions list
 * @param {number} index
 * @return {Object}
 */
export const deleteAction = triggersProjectSave((path, index) => ({
  type: PROJECT_BOOBEN_VALUE_DELETE_ACTION,
  path,
  index,
}));

/**
 *
 * @param {Path} path
 * @param {Immutable.Map<number, Object>} components
 * @param {number} rootId
 * @return {Object}
 */
export const constructComponentForProp = (path, components, rootId) => ({
  type: PROJECT_BOOBEN_VALUE_CONSTRUCT_COMPONENT,
  path,
  components,
  rootId,
});

/**
 *
 * @return {Object}
 */
export const cancelConstructComponentForProp = () => ({
  type: PROJECT_BOOBEN_VALUE_CONSTRUCT_COMPONENT_CANCEL,
});

/**
 *
 * @return {Object}
 */
export const saveComponentForProp = triggersProjectSave(() => ({
  type: PROJECT_BOOBEN_VALUE_CONSTRUCT_COMPONENT_SAVE,
}));

/**
 *
 * @param {number} componentId
 * @param {string} newTitle
 * @return {Object}
 */
export const renameComponent = triggersProjectSave((componentId, newTitle) => ({
  type: PROJECT_COMPONENT_RENAME,
  componentId,
  newTitle,
}));

export const changeComponentStyle =
  triggersProjectSave((componentId, style) => ({
    type: PROJECT_COMPONENT_CHANGE_STYLE,
    componentId,
    style,
  }));

/**
 *
 * @param {number} componentId
 * @param {number} regionIdx
 * @param {boolean} enable
 * @return {Object}
 */
export const toggleComponentRegion = triggersProjectSave(
  (componentId, regionIdx, enable) => ({
    type: PROJECT_COMPONENT_TOGGLE_REGION,
    componentId,
    regionIdx,
    enable,
  }),
);

/**
 *
 * @param {number} layoutIdx
 * @return {Object}
 */
export const selectLayoutForNewComponent = triggersProjectSave(layoutIdx => ({
  type: PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT,
  layoutIdx,
}));

/**
 *
 * @param {number} componentId
 * @return {Object}
 */
export const convertComponentToList = triggersProjectSave(
  componentId => ({
    type: PROJECT_COMPONENT_CONVERT_TO_LIST,
    componentId,
  }),
);

/**
 *
 * @param {string} name
 * @param {string} title
 * @param {string} description
 * @param {{ name: string, type: string }[]} args
 * @param {string} returnType
 * @param {string} code
 * @return {Object}
 */
export const createFunction = triggersProjectSave((
  name,
  title,
  description,
  args,
  returnType,
  code,
  spreadLastArg,
) => ({
  type: PROJECT_CREATE_FUNCTION,
  name,
  title,
  description,
  args,
  returnType,
  code,
  spreadLastArg,
}));

/**
 *
 * @param {?Function} [filter=null]
 * @return {Object}
 */
export const pickComponent = (filter = null) => ({
  type: PROJECT_PICK_COMPONENT,
  pickData: false,
  filter,
  dataGetter: null,
});

/**
 * @typedef {Object} ComponentDataItem
 * @property {string} name
 * @property {string} description
 * @property {boolean} unavailable
 * @property {*} data
 */

/**
 *
 * @param {?function(componentId: number): boolean} [filter=null]
 * @param {?function(componentId: number): Array<ComponentDataItem>} [dataGetter=null]
 * @return {Object}
 */
export const pickComponentData = (filter = null, dataGetter = null) => ({
  type: PROJECT_PICK_COMPONENT,
  pickData: true,
  filter,
  dataGetter,
});

/**
 *
 * @type {Object<string, number>}
 */
export const ComponentPickAreas = {
  UNKNOWN: -1,
  CANVAS: 0,
  TREE: 1,
};

/**
 *
 * @param {number} componentId
 * @param {number} pickArea
 * @return {Object}
 */
export const pickComponentDone = (componentId, pickArea) => ({
  type: PROJECT_PICK_COMPONENT_DONE,
  componentId,
  pickArea,
});

/**
 *
 * @return {Object}
 */
export const pickComponentCancel = () => ({
  type: PROJECT_PICK_COMPONENT_CANCEL,
});

/**
 *
 * @param {*} data
 * @return {Object}
 */
export const pickComponentDataDone = data => ({
  type: PROJECT_PICK_COMPONENT_DATA,
  data,
});

/**
 *
 * @return {Object}
 */
export const pickComponentDataCancel = () => ({
  type: PROJECT_PICK_COMPONENT_DATA_CANCEL,
});

/**
 *
 * @return {Object}
 */
export const undo = triggersProjectSave(() => ({
  type: PROJECT_UNDO,
}));

/**
 *
 * @return {Object}
 */
export const redo = triggersProjectSave(() => ({
  type: PROJECT_REDO,
}));

/**
 *
 * @param {number} containerId
 * @param {number} afterIdx
 * @return {Object}
 */
export const moveCursor = (containerId, afterIdx) => ({
  type: PROJECT_MOVE_CURSOR,
  containerId,
  afterIdx,
});
