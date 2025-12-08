// babel.config.js
export default {
  presets: [
    ['@babel/preset-env', { modules: 'auto' }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
};
