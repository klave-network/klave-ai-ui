import antfu from '@antfu/eslint-config';

export default antfu(
    {
        type: 'app',
        react: true,
        yaml: false,
        typescript: true,
        formatters: true,
        stylistic: {
            indent: 4,
            semi: true,
            quotes: 'single'
        }
    },
    {
        rules: {
            'eslint-comments/no-unlimited-disable': 'warn',
            '@stylistic/comma-dangle': ['error', 'never'],
            'ts/no-redeclare': 'off',
            'ts/consistent-type-definitions': ['error', 'type'],
            'no-console': ['warn'],
            'antfu/no-top-level-await': ['off'],
            'node/prefer-global/process': ['off'],
            'node/no-process-env': ['error'],
            'perfectionist/sort-imports': [
                'error',
                {
                    tsconfigRootDir: '.'
                }
            ],
            'unicorn/filename-case': [
                'error',
                {
                    case: 'kebabCase',
                    ignore: ['README.md', 'reportWebVitals.ts', 'routeTree.gen.ts']
                }
            ]
        }
    }
);
