# Changelog

## [3.0.2](https://github.com/teqbench/tbx-mat-bottom-sheets/compare/v3.0.1...v3.0.2) (2026-05-10)


### Bug Fixes

* **ci:** pin reusable workflows to v2.9.3 ([2072a8c](https://github.com/teqbench/tbx-mat-bottom-sheets/commit/2072a8c87ceab3023963553904bf3ae6cb25bbe4)), closes [#28](https://github.com/teqbench/tbx-mat-bottom-sheets/issues/28)
* **deps:** bump tbx-mat-icons and tbx-mat-severity-theme peerDeps ([ccadf61](https://github.com/teqbench/tbx-mat-bottom-sheets/commit/ccadf619ba50ddd6ce8e66344d32e72adb26a1d2))
* **deps:** bump tbx-mat-icons and tbx-mat-severity-theme peerDeps ([785933a](https://github.com/teqbench/tbx-mat-bottom-sheets/commit/785933a4d2630f444ae9c3b55c8f0bcab36acb5f)), closes [#28](https://github.com/teqbench/tbx-mat-bottom-sheets/issues/28)

## [3.0.1](https://github.com/teqbench/tbx-mat-bottom-sheets/compare/v3.0.0...v3.0.1) (2026-05-09)


### Bug Fixes

* **ci:** pin reusable workflows to v2.6.0 ([84937da](https://github.com/teqbench/tbx-mat-bottom-sheets/commit/84937daa1211c38c98e232b0d9ddad7681797924))
* **ci:** pin reusable workflows to v2.6.0 + bump teqbench peerDeps ([b5a39df](https://github.com/teqbench/tbx-mat-bottom-sheets/commit/b5a39df25699256077e1298185da56258095f6d4))
* **deps:** bump teqbench peerDeps to latest patches ([5da2e6c](https://github.com/teqbench/tbx-mat-bottom-sheets/commit/5da2e6c641cf4bbac67d9faaf0a2ca39a6a528ad))
* **shell:** remove asymmetric spacing above the second divider ([4a07878](https://github.com/teqbench/tbx-mat-bottom-sheets/commit/4a07878830b345511cfb3535b8e71c7c3a5b8634))
* **shell:** symmetric divider spacing, badge URLs, drop SETUP.md ([76246c8](https://github.com/teqbench/tbx-mat-bottom-sheets/commit/76246c8295eaaa05ec7b53262e525237976a0f2c))

## [3.0.0](https://github.com/teqbench/tbx-mat-bottom-sheets/compare/v2.0.0...v3.0.0) (2026-05-08)


### ⚠ BREAKING CHANGES

* Consumers update their npm dependency from `@teqbench/tbx-mat-bottom-sheet` to `@teqbench/tbx-mat-bottom-sheets`, and update SCSS imports from `@teqbench/tbx-mat-bottom-sheet/styles/tbx-mat-bottom-sheet` to `@teqbench/tbx-mat-bottom-sheets/styles/tbx-mat-bottom-sheets`. The old package name (1.0.x and 2.0.0) remains on the registry as a historical artifact; new releases publish only under the new name.

### Features

* rename package to @teqbench/tbx-mat-bottom-sheets ([4fda113](https://github.com/teqbench/tbx-mat-bottom-sheets/commit/4fda1132f5868f46029c70f23d413d747a70f7f6))

## [2.0.0](https://github.com/teqbench/tbx-mat-bottom-sheet/compare/v1.0.1...v2.0.0) (2026-05-08)


### ⚠ BREAKING CHANGES

* **api:** footer buttons can no longer set `emphasis: 'destructive'`. Migrate by removing the destructive emphasis and elevating the bottom sheet's `severity` to 'warning' or 'error'.

### Features

* **api:** drop destructive emphasis — use bottom-sheet severity for destructive prompts ([fe53c91](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/fe53c91a59b9b46f9f7efdd028560d2ff019784d))


### Bug Fixes

* **styles:** decouple close-icon opacity from action-button opacity ([8f41773](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/8f4177383a00e36f7df0be5d0c659ff0ed0acf80))

## [1.0.1](https://github.com/teqbench/tbx-mat-bottom-sheet/compare/v1.0.0...v1.0.1) (2026-05-07)


### Bug Fixes

* align repo with tbx-models conventions and publish CHANGELOG.md ([522c19a](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/522c19a361f6bbd0da492ba79fabcc679c323dcd))
* **build:** include CHANGELOG.md as a published ng-packagr asset ([25265fa](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/25265fa57654c177a1752950fb45ae110e3abc25))
* **docs:** remove residual Dependabot prose from renovate.md ([ebfd2dd](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/ebfd2ddf9d12d8aa708ccc688342e45d4dacfbec))

## [1.0.0](https://github.com/teqbench/tbx-mat-bottom-sheet/compare/v0.7.0...v1.0.0) (2026-05-07)


### ⚠ BREAKING CHANGES

* TbxMatBottomSheetConfig.dragHandle is removed.

### Features

* add BottomSheetShellComponent (header + body + footer chrome) ([6fe8244](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/6fe82444e15a7d1de78c652cf5804c63017b3265))
* add close font-icon resolver service + spec ([3ac1193](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/3ac1193649f3510b0ec3cecd2f97ea7e19309a56))
* add config / result / input-data models ([f94eafe](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/f94eafef1012e844d73fa2d3defc5a02935fba3f))
* add config-args / footer-control / icon-resolver type aliases ([8717136](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/8717136634feb404dd88e485fa63869f47d7ca26))
* add footer-item interfaces (button, checkbox, toggle, radio-group, toggle-group) ([fe469d7](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/fe469d76f4d114863609ad5a9d457387aef9c1c4))
* add internal ResolvedIcon model ([66ad54e](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/66ad54e51c5d2f2221532cd7ca54d93b7b6fb35a))
* add OK / OK_CANCEL / YES_NO / YES_NO_CANCEL button presets ([a34b832](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/a34b8320375dfd837d452cee8bdfc0e93a371f7e))
* add provider-config model ([cbf1cbe](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/cbf1cbe689100f9513d527c62b67db819f1268f7))
* add severity font-icon resolver service + spec ([f7f8134](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/f7f813496f4ac0975f27d4f38c1f9a70f791e58b))
* add severity SVG-icon resolver service + spec ([fc15c29](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/fc15c29d75222642f813414d0f67e5841901634d))
* add TBX_MAT_BOTTOM_SHEET_PROVIDER_CONFIG injection token ([bbc5004](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/bbc50040598e0b331aaf313aa0b28c2cc6d1a3f8))
* add TbxMatBottomSheetDismissReason enum ([21d3428](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/21d342803ada4d36bc75e31865559cf1f30f3004))
* add TbxMatBottomSheetService with show / severity / confirm / input methods ([092b048](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/092b0481d98f2fabd0887e6f6685dcf3f45ddfc2))
* expose public API via src/index.ts barrel ([ede68e7](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/ede68e7e9714a14cb94ae1b4155cf63ca07fb8fa))
* implement @teqbench/tbx-mat-bottom-sheet package ([cc23b73](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/cc23b7381ebd6f1fb361162a06079bae1d2dade1))
* remove dragHandle config flag and shell pill DOM ([6ba56cb](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/6ba56cb9da50a194a7ccc4a658c321c89b9284bb))
* render drag-handle pill above header when config.dragHandle is true ([3488264](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/34882644bbe9dc02c3391780c603fc619194fbb8))
* **styles:** add bottom-sheet panel classes and drag-handle pill styles ([f310c06](https://github.com/teqbench/tbx-mat-bottom-sheet/commit/f310c06945d670302d6377b68671bed3c0d100b0))

## [0.7.0](https://github.com/teqbench/teqbench.dev.templates.tbx-package/compare/v0.6.2...v0.7.0) (2026-05-07)


### Features

* **template:** codify pinned-rationale convention and Angular overlay hints ([7a9907d](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/7a9907da756c6895da49c25f677c719020e6ecc6))


### Bug Fixes

* **docs:** add Concurrency section to dep-compat-check workflow doc ([9eebc70](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/9eebc704f013aaff1ed9f808955c07c8d9b24485))
* **docs:** escape curly braces in greet TSDoc to satisfy tsdoc/syntax ([13b9073](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/13b9073b973d17f51653b81275e3b06a43505bc2))
* **template:** address tbx-code-review findings ([306c2d9](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/306c2d91891b140089ded05d8fae1bb7efaf141f))
* **template:** apply remaining tbx-code-review findings ([e9100f0](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/e9100f0c87a08924d91be6cee74987aa0bc3c659))

## [0.6.2](https://github.com/teqbench/teqbench.dev.templates.tbx-package/compare/v0.6.1...v0.6.2) (2026-04-03)


### Bug Fixes

* **security:** switch reporting channel to email for private template repo ([5d0309d](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/5d0309dbb948341cd83a8f39e05cba4d6648ccf4))
* **tsdoc:** set related tag to allowMultiple matching CLAUDE.md convention ([3e346a2](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/3e346a21c052ccbd02b76b49714a716d28238ad3))

## [0.6.1](https://github.com/teqbench/teqbench.dev.templates.tbx-package/compare/v0.6.0...v0.6.1) (2026-03-25)


### Bug Fixes

* **publish:** remove invalid comment field from ng-package.json ([47884f5](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/47884f5ed1c3d267ae27316ce3caa3b1298f71ea))
* **publish:** switch to publishing from dist/ directly ([343ec14](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/343ec1418a941453bbb971b758f6a68c29dc1ab8))
* **publish:** switch to publishing from dist/ directly ([8d96cf1](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/8d96cf1eabd553ba734b3171255e23c46c93a8d3))

## [0.6.0](https://github.com/teqbench/teqbench.dev.templates.tbx-package/compare/v0.5.2...v0.6.0) (2026-03-24)


### Features

* **config:** configure ESM import extensions for Node module resolution ([ff58eb7](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/ff58eb7f94101297411e6103eb8120fab8443673))
* **config:** configure ESM import extensions for Node module resolution ([7e75d6c](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/7e75d6c439155701552a4c207330d26be530d8f1))
* **config:** ESM import extensions and GitHub Packages access docs ([615d53b](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/615d53bf4a7a9a5bf7d845288d96b0c48649709c))

## [0.5.2](https://github.com/teqbench/teqbench.dev.templates.tbx-package/compare/v0.5.1...v0.5.2) (2026-03-24)


### Bug Fixes

* **ci:** add GitHub Packages prerequisites to CONTRIBUTING.md ([81c3228](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/81c322888b24a94c802d5dc38421003bf620b9c2))
* **ci:** configure GitHub Packages auth with setup-node and NODE_AUTH_TOKEN ([37660aa](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/37660aade632878e55469227250a5f31f28f1fe8))

## [0.5.1](https://github.com/teqbench/teqbench.dev.templates.tbx-package/compare/v0.5.0...v0.5.1) (2026-03-24)


### Bug Fixes

* **ci:** configure GitHub Packages auth with setup-node and NODE_AUTH_TOKEN ([7cbdf60](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/7cbdf603aac888a8e28894d00ec073c1186458ce))
* **ci:** configure GitHub Packages auth with setup-node and NODE_AUTH_TOKEN ([5f32cb9](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/5f32cb9ffd62cc547b5b077bfab84aadb5fdcec1))

## [0.5.0](https://github.com/teqbench/teqbench.dev.templates.tbx-package/compare/v0.4.2...v0.5.0) (2026-03-23)


### Features

* **setup:** add Angular test infrastructure step to SETUP.md checklist ([4c151d6](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/4c151d681ac4b051f934ed005c7704f852de8f83))
* **setup:** add Angular test infrastructure step to SETUP.md checklist ([c02cc9b](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/c02cc9bc84991b7c8930ad2c861a2ffbeff497af))

## [0.4.2](https://github.com/teqbench/teqbench.dev.templates.tbx-package/compare/v0.4.1...v0.4.2) (2026-03-23)


### Bug Fixes

* **ci:** use \s+ in README version drift regex for TypeScript row ([995cb7c](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/995cb7ce0542a6f892e0110265205a0c6db4fbc6))
* **ci:** use \s+ in README version drift regex for TypeScript row ([6ea7415](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/6ea74155b45532b92127f05b1df91c54e9896bc3))
* **ci:** use \s+ in README version drift regex for TypeScript row ([00b680b](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/00b680b2b35b32cbdb5899809faa0574e853d1e3))

## [0.4.1](https://github.com/teqbench/teqbench.dev.templates.tbx-package/compare/v0.4.0...v0.4.1) (2026-03-23)


### Bug Fixes

* **readme:** use actual repo name in badge URLs ([694c4d6](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/694c4d6cb61facae1a1a144d3731f78fac8a54d6))
* **readme:** use actual repo name in badge URLs ([5507518](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/55075185cb11c83fa8d7d934ed2efea762548ad5))

## [0.4.0](https://github.com/teqbench/teqbench.dev.templates.tbx-package/compare/v0.3.2...v0.4.0) (2026-03-23)


### Features

* **ci:** migrate badges from committed SVGs to Shields.io gist endpoints ([649d8c6](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/649d8c6cf7e00f5e11395ec2f211c79c99be3e4f))
* **ci:** migrate badges from committed SVGs to Shields.io gist endpoints ([0e2faeb](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/0e2faeb7a748aa725964a1e003831c6b54a72c05))

## [0.3.2](https://github.com/teqbench/teqbench.dev.templates.tbx-package/compare/v0.3.1...v0.3.2) (2026-03-22)


### Bug Fixes

* **ci:** handle race condition in sync workflow ([a4f277e](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/a4f277ea6575c0dbecb6841122e6c2e8e2e24469))
* **ci:** handle race condition in sync workflow ([a302093](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/a302093a83defd0b6c5510d553ccb3730c34e5f0))
* use dev build number badge (build [#76](https://github.com/teqbench/teqbench.dev.templates.tbx-package/issues/76)) ([75685f2](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/75685f2da65a249b0d9664d81d020adbde3d61ca))

## [0.3.1](https://github.com/teqbench/teqbench.dev.templates.tbx-package/compare/v0.3.0...v0.3.1) (2026-03-22)


### Bug Fixes

* **setup:** move dep-compat to auto, add verification table ([964483e](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/964483ea1e6ca3cc0a2cfd7dc9f551215fba7358))

## [0.3.0](https://github.com/teqbench/teqbench.dev.templates.tbx-package/compare/v0.2.0...v0.3.0) (2026-03-22)


### Features

* **ci:** add test count and coverage badges ([d74fa64](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/d74fa64dc4f3c42e56fab45c69ce7d7768d2777e))
* **ci:** add test count and coverage badges ([31d9e14](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/31d9e14ec5d0252c8bb27ed576d11974fbb884b1))

## [0.2.0](https://github.com/teqbench/teqbench.dev.templates.tbx-package/compare/v0.1.0...v0.2.0) (2026-03-22)


### Features

* scaffold teqbench package template ([47fb9c7](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/47fb9c7a708581e9d6188ceaef1ff1214938cc83))
* **template:** harden package template to production-grade ([20cd619](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/20cd6191c9248171f3542b82c381e8ed5c5d1d20))
* **template:** harden package template to production-grade ([b0ec3a2](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/b0ec3a21eab0c23eb1ccfeed83908ba63db436a3))


### Bug Fixes

* **ci:** add Dependabot ignore rules for @types/node and ESLint ([576d5c1](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/576d5c1966ce288b5439f4f41d57e8dd155b8cab))
* **ci:** Dependabot ignore rules and Prettier exclusion for release-please ([f3f3bf5](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/f3f3bf5ff493318afc4cd48bcac5cd09ec024588))
* **ci:** exclude .release-please-manifest.json from Prettier ([813b86d](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/813b86d3a32ef27df9e53352f1fcc5b18b047b01))
* **ci:** prevent Dependabot from bumping @types/node to next major ([1407f02](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/1407f022a83ae641f0ec9f04f1d563b6d9e4fce1))
* **ci:** remove .badges/ from .gitignore so CI can commit badges ([eb8c382](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/eb8c382f51f968fada1d94f4e7367ce28b93ae91))
* **ci:** remove .badges/ from .gitignore so CI can commit badges ([8d43f53](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/8d43f53cf1c1986628cb655c5fdc4eb3e4c28297))
* **deps:** add @vitest/coverage-v8 required by test:coverage ([693851b](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/693851b0bfb658acda5ad365a6e36bdd6363244b))
* **template:** address review findings — coverage, setup steps, and dep pinning ([759a32c](https://github.com/teqbench/teqbench.dev.templates.tbx-package/commit/759a32cc8894130bc986b48df36d7f1166ea5a7e))

## Changelog
