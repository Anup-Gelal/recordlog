import  React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { store,persistor } from './Redux/store.js';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/es/integration/react";
import ThemeProvider from './components/ThemeProvider.jsx';



ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Provider>
    </PersistGate>
  </React.StrictMode>
);
