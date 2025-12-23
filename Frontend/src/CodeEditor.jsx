import './CodeEditor.css'
import Editor from '@monaco-editor/react'
import React, {useCallback, useEffect, useRef, useState, useMemo} from 'react'
import TerminalHandler from "./TerminalHandler.jsx";
import { useSearchParams } from 'react-router-dom';
import { Play, SquareTerminal, Hash, Code2, MessageSquareCode, User} from 'lucide-react';

const useThrottledSocket = (socket, id, roomid, interval = 100) => {
    const lastSent = useRef(0);

    const sendThrottled = (code) => {
        const now = Date.now();

        if (now - lastSent.current >= interval) {
            if (socket.current?.readyState === WebSocket.OPEN) {
                socket.current?.send(JSON.stringify({type:'updatecode', roomid:roomid,id:id, code: code}));
                lastSent.current = now;
            }
        }
    };

    return sendThrottled;
};

function CodeEditor({usernameprop}){
    const editorRef = useRef(null);
    const compilerSocket=useRef(null);
    const editorSocket=useRef(null);
    const terminal=useRef(null);
    const [searchParams] = useSearchParams();
    const roomID = searchParams.get('roomid');
    const [username, setUsername] = useState('');
    const [id, setId] = useState(0);
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
    const serverUpdate=useRef(false);

    useEffect(() => {
        if (!usernameprop) setShowUsernamePrompt(true);
        else {
            setUsername(usernameprop);
            setShowUsernamePrompt(false);
        }
    }, [usernameprop]);

    console.log("username:"+username);

    useEffect(()=>{
        if (showUsernamePrompt) return;
        //Server Connection
        editorSocket.current=new WebSocket("ws://192.168.100.84:8080/editor/")
        editorSocket.current.onopen=()=>{
            editorSocket.current.send(JSON.stringify({
                roomid:roomID,
                type:'roomconnect'
            }))
        }
        editorSocket.current.onmessage=(e)=>{
            const data=JSON.parse(e.data);
            if (data.type=='connected'){
                setId(data.id)
                editorRef.current?.setValue(data.code)
            }
            if (data.type=='updatecode'){
                serverUpdate.current=true
                let pos=editorRef.current.getPosition()
                editorRef.current?.setValue(data.code)
                editorRef.current.setPosition(pos)
            }
        }
        //Server Compiler Connection
        compilerSocket.current=new WebSocket("ws://192.168.100.84:8080/compiler/")
        compilerSocket.current.onmessage = async (e)=>{
            const data=JSON.parse(e.data)
            console.log(data)
            if (data.type=='input_request'){
                terminal.current.write(" ")
                terminal.current.write(data.prompt)
                const inp= await terminal.current.read()
                compilerSocket.current.send(JSON.stringify({type: 'input_response', msgid:data.msgid, input:inp}))
            }
            else if (data.type=='output'){
                terminal.current.write(" ")
                terminal.current.write(data.output)
                terminal.current.write("\r")
            }
            else if (data.type=="error"){
                terminal.current.write(" ")
                terminal.current.write(data.error)
            }
        }
        return () => {
            if (compilerSocket.current) {
                compilerSocket.current.close();
            }
            if (editorSocket.current) {
                editorSocket.current.close();
            }
        }
    }, [showUsernamePrompt])

    const codeUpdater=useThrottledSocket(editorSocket, id, roomID,100)

    const handleEditorWillMount = useCallback((monaco) => {
        monaco.editor.defineTheme('collab-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: '', foreground: 'e5e7eb' },
                { token: 'keyword', foreground: 'c678dd', fontStyle: 'bold' },
                { token: 'identifier', foreground: '61afef' },
                { token: 'string', foreground: '98c379' },
                { token: 'number', foreground: 'd19a66' },
                { token: 'comment', foreground: '7f848e', fontStyle: 'italic' },
            ],
            colors: {
                'editor.background': '#09090b',
                'editor.foreground': '#e5e7eb',
                'editor.lineHighlightBackground': '#1e1e1e',
                'editorCursor.foreground': '#4f46e5',
                'editor.selectionBackground': '#4f46e533',
                'editorIndentGuide.activeBackground': '#4f46e5',
                'editorLineNumber.foreground': '#4b5563',
            }
        });
    }, [])

    const editorOptions = useMemo(() => ({
        minimap: { enabled: true },
        fontSize: 14,
        padding: { top: 15 },
        scrollBeyondLastLine: false,
        fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on"
    }), []);

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    function handleEditorChange(value, event) {
        if (serverUpdate.current===true) {serverUpdate.current=false;return;}
        codeUpdater(value);
    }

    function showValue() {
        console.log(editorRef.current.getValue());
        terminal.current.clear();
        compilerSocket.current.send(JSON.stringify({type:'compile', code:editorRef.current.getValue()}));
    }

    function handleUsernameSubmit(){
        setShowUsernamePrompt(false)
    }
    return (
        <div className="ide-container">
            {showUsernamePrompt && (
                <div className="modal-overlay">
                    <form onSubmit={handleUsernameSubmit} className="modal-card">
                        <h2 className="modal-title">Enter Display Name</h2>
                        <input
                            name="username"
                            className="modal-input"
                            placeholder="e.g. CodeWizard"
                            autoFocus
                            autoComplete="off"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <button type="submit" className="modal-btn">Join Room</button>
                    </form>
                </div>
            )}
            <header className="ide-header">
                <div className="header-left">
                    <div className="brand">
                        <MessageSquareCode size={20} color="#4f46e5" />
                        <span>CollabCode</span>
                    </div>
                    <div className="room-badge">
                        <Hash size={14} />
                        <span>{roomID || "Offline"}</span>
                    </div>
                    <div className="username-badge">
                        <User size={14} />
                        <span>{username || "Guest"}</span>
                    </div>
                </div>
                <button onClick={showValue} className="run-btn">
                    <Play size={16} fill="currentColor" />
                    Run Code
                </button>
            </header>
            <main className="ide-workspace">
                <div className="editor-wrapper">
                    <Editor
                        height="100%"
                        width="100%"
                        defaultLanguage="python"
                        defaultValue="# Write your Python code here..."
                        theme="collab-dark"
                        options={editorOptions}
                        beforeMount={handleEditorWillMount}
                        onMount={handleEditorDidMount}
                        onChange={handleEditorChange}
                    />
                </div>
                <div className="terminal-wrapper">
                    <div className="terminal-header">
                        <SquareTerminal size={14} />
                        <span>Terminal Output</span>
                    </div>
                    <div className="terminal-body">
                        <TerminalHandler ref={terminal} />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CodeEditor