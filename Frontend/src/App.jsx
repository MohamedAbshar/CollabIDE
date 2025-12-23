import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Import these
import CodeEditor from "./CodeEditor.jsx";
import Home from "./Home.jsx";
import {useState} from "react";

function App() {

    const [username, setUsername] = useState('');

    function handleUsernameChange(e) {
        setUsername(e);
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home updateUsername={handleUsernameChange}/>} />
                <Route path="/editor" element={<CodeEditor usernameprop={username}/>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App