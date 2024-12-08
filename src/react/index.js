import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import { GlobalProvider } from './context/GlobalContext';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
<GlobalProvider>
    <App/>
</GlobalProvider>)