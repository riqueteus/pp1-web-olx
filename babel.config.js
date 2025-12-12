// babel.config.js
export default {
  presets: [
    ['@babel/preset-env', { modules: 'auto' }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [
    function() {
      return {
        visitor: {
          MemberExpression(path) {
            if (
              path.node.object &&
              path.node.object.type === 'MetaProperty' &&
              path.node.object.meta.name === 'import' &&
              path.node.object.property.name === 'meta' &&
              path.node.property.name === 'env'
            ) {
              // Transforma import.meta.env em process.env
              path.replaceWithSourceString('process.env');
            }
          },
          MetaProperty(path) {
            if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
              // Se for import.meta (sem .env), mantém como está mas adiciona fallback
              const parent = path.parent;
              if (parent && parent.type === 'MemberExpression' && parent.property.name === 'env') {
                // Já foi tratado pelo visitor de MemberExpression acima
                return;
              }
            }
          },
        },
      };
    },
  ],
};
