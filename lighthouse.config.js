/* eslint-env node */
/* eslint-disable no-undef */
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist'
    },
    upload: {
      target: 'temporary-public-storage'
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['warn', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.95 }]
      }
    }
  }
};
