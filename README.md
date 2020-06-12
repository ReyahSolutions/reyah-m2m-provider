# Reyah M2M auth provider
Reyah M2M auth provider for Node.js written in TypeScript

## Compile
This project use typescript

```bash
yarn install
yarn build
```

## Usage

```javascript
import Reyah from '@reyah/api-sdk';
import M2MAuthProvider from '@reyah/m2m-auth-provider';

const provider = new M2MAuthProvider('client_id', 'client_secret', ['optional scopes']);
Reyah.Auth.getInstance().useAuthProvider(provider);
```

## Docs
The documentation is generated with Typedoc.

```bash
yarn install
yarn run gendoc
```
