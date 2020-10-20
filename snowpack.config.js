module.exports = {
    mount: {
      public: '/',
      src: '/_dist_',
    },
    buildOptions: {
      out: 'dist'
    },
    plugins: ['@snowpack/plugin-optimize']
  };
  