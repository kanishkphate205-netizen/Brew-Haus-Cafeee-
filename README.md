# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
# Brew Haus Café

## Run locally

Install dependencies with `npm install`, then run `npm run dev`. This starts the Vite frontend and the Node API together. Open the local URL printed by Vite. The frontend forwards `/api` requests to the API on port 3001.

The API can also be started on its own with `npm run start:api`. Set `API_PORT` to change its port; the Vite proxy uses the same setting.

## Orders and reservations

- Add menu items to the cart, adjust quantities, then submit your name and phone number to place an order.
- Submit the reservation form with your name, phone number, date, time, and party size.
- The API validates submissions and writes accepted records to `data/orders.json` and `data/reservations.json`. These files contain customer information and are excluded from Git.
- The order API recalculates item prices from the server menu before saving the order.

For production, deploy the Node API alongside the frontend and route `/api` requests to it through your hosting provider's reverse proxy. Order and reservation JSON files are suitable for a local/demo setup; use a managed database for a multi-instance production deployment.
