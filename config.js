const convict = require('convict');
const path = require('path');

convict.addFormat({
  name: 'strings-array',

  validate: val => {
    if (!Array.isArray(val) || val.some(v => typeof v !== 'string')) {
      throw new Error('must be an array of strings');
    }
  },

  coerce: val => val.split(',').map(v => v.trim()).filter(v => v !== ''),
});

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },

  config: {
    doc: 'Custom config file to load',
    format: String,
    default: '',
    arg: 'config',
  },

  logLevel: {
    doc: 'Logging level',
    format: ['trace', 'verbose', 'debug', 'info', 'warn', 'error', 'critical'],
    default: 'info',
  },

  port: {
    doc: '',
    format: 'port',
    default: 3000,
    env: 'BOOBEN_PORT',
  },

  serveStatic: {
    doc: '',
    format: Boolean,
    default: false,
    env: 'BOOBEN_SERVE_STATIC',
  },

  projectsDir: {
    doc: 'Projects directory. Default value is for Docker build.',
    format: String,
    default: '/var/lib/booben/projects',
    env: 'BOOBEN_PROJECTS_DIR',
  },

  defaultComponentLibs: {
    doc: '',
    format: 'strings-array',
    default: [],
    env: 'BOOBEN_DEFAULT_COMPONENT_LIBS',
  },
});

// Load environment dependent configuration
const env = config.get('env');
config.loadFile(path.join(__dirname, 'config', `${env}.json`));

// Load custom config file
const customConfigFile = config.get('config');
if (customConfigFile) config.loadFile(customConfigFile);

// Perform validation
config.validate({
  strict: true,
});

module.exports = config;
