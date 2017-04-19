/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 *
 * @type {{components: Object<string, ComponentMeta>}}
 * @const
 */
export default {
  components: {
    Text: {
      displayName: 'Text',
      textKey: 'name',
      descriptionTextKey: 'description',
      kind: 'atomic',
      hidden: true,
      props: {
        text: {
          textKey: 'props_text',
          descriptionTextKey: 'props_text_desc',
          type: 'string',
          source: ['static', 'data', 'state', 'routeParams'],
          sourceConfigs: {
            static: {
              defaultTextKey: 'default',
            },
            data: {},
            state: {},
            routeParams: {},
          },
        },
      },
      propGroups: [],
      strings: {
        name: {
          en: 'Text',
        },
        description: {
          en: '',
        },
        props_text: {
          en: 'Text',
        },
        props_text_desc: {
          en: '',
        },
        default: {
          en: 'Text',
        },
      },
      tags: new Set(),
    },

    Outlet: {
      displayName: 'Outlet',
      textKey: 'name',
      descriptionTextKey: 'description',
      kind: 'atomic',
      props: {},
      propGroups: [],
      strings: {
        name: {
          en: 'Outlet',
        },
        description: {
          en: '',
        },
      },
      tags: new Set(),
    },

    List: {
      displayName: 'List',
      textKey: 'name',
      descriptionTextKey: 'description',
      kind: 'atomic',
      hidden: true,
      props: {
        data: {
          textKey: 'props_data',
          descriptionTextKey: 'props_data_desc',
          type: 'array',
          source: ['static', 'data'],
          sourceConfigs: {
            static: {
              default: [],
            },
            data: {
              pushDataContext: 'item',
            },
          },
        },
        component: {
          textKey: 'props_component',
          descriptionTextKey: 'props_component_desc',
          type: 'component',
          source: ['designer'],
          sourceConfigs: {
            designer: {
              props: {
                item: {
                  textKey: 'props_component_props_item',
                  descriptionTextKey: 'props_component_props_item_desc',
                  dataContext: 'item',
                },
              },
            },
          },
        },
      },
      propGroups: [],
      strings: {
        name: {
          en: 'List',
        },
        description: {
          en: '',
        },
        props_data: {
          en: 'Data',
        },
        props_data_desc: {
          en: '',
        },
        props_component: {
          en: 'Item component',
        },
        props_component_desc: {
          en: '',
        },
        props_component_props_item: {
          en: 'item',
        },
        props_component_props_item_desc: {
          en: '',
        },
      },
      tags: new Set(),
    },
  },
};
