import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, SquareTerminal, Hash, MessageSquareCode, Users, User, ArrowRight, Zap, Terminal} from 'lucide-react';
import './Home.css'

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`btn btn-${variant} ${className}`}
        >
            {Icon && <Icon size={18} className="btn-icon" />}
            {children}
        </button>
    );
};

const Input = ({ label, icon: Icon, value, onChange, placeholder, readOnly = false, action }) => (
    <div className="input-wrapper">
        <label className="input-label">{label}</label>
        <div className="input-group">
            <div className="input-icon-left">
                <Icon size={18} />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                readOnly={readOnly}
                placeholder={placeholder}
                className={`form-input ${readOnly ? 'read-only' : ''}`}
            />
            {action && (
                <div className="input-action-right">
                    {action}
                </div>
            )}
        </div>
    </div>
);

const LandingPage = ({ onJoin}) => {
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const navigate=useNavigate();

    const generateRoomId = () => {
        const chars = '123456789';
        let result = 'R';
        for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        setRoomId(result);
        setIsCreating(true);
        onJoin(username, result);
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (!username || !roomId) return;
        onJoin(username, roomId);
    };

    return (
        <div className="page-container landing-page">
            <div className="bg-gradient-orb orb-1" />
            <div className="bg-gradient-orb orb-2" />

            {/* Navbar */}
            <nav className="navbar">
                <div className="logo-section">
                    <div className="logo-icon-box">
                        <MessageSquareCode size={24} className="text-white" />
                    </div>
                    <span className="logo-text">Collab<span className="accent-text">Code</span></span>
                </div>
                <div className="nav-links">
                    <a href="#" className="nav-link">Features</a>
                    <a href="#" className="nav-link">Pricing</a>
                    <a href="#" className="nav-link">Docs</a>
                </div>
            </nav>

            {/* Main Content */}
            <main className="landing-main">
                <div className="landing-content">

                    <div className="hero-text">
                        <h1 className="hero-title">
                            Code Together.
                        </h1>
                        <p className="hero-subtitle">Real-time collaboration for developers.</p>
                    </div>

                    <div className="login-card">
                        <form onSubmit={handleJoin} className="login-form">

                            <Input
                                label="Display Name"
                                icon={User}
                                placeholder="e.g. dev_sarah"
                                value={username}
                                onChange={setUsername}
                            />

                            <div className="room-input-container">
                                <Input
                                    label="Room ID"
                                    icon={Hash}
                                    placeholder="ENTER-CODE"
                                    value={roomId}
                                    onChange={(val) => {
                                        setRoomId(val.toUpperCase());
                                        setIsCreating(false);
                                    }}
                                    action={
                                        roomId && (
                                            <button
                                                type="button"
                                                onClick={() => navigator.clipboard.writeText(roomId)}
                                                className="icon-btn"
                                                title="Copy Room ID"
                                            >
                                            </button>
                                        )
                                    }
                                />
                            </div>

                            <div className="form-actions">
                                <Button
                                    onClick={handleJoin}
                                    variant="primary"
                                    className="w-full"
                                    disabled={!username || !roomId}
                                    icon={ArrowRight}
                                >
                                    {isCreating ? 'Join Room' : 'Join Room'}
                                </Button>
                            </div>

                            <div className="divider">
                                <div className="line"></div>
                                <span className="divider-text">Or</span>
                                <div className="line"></div>
                            </div>

                            <Button
                                onClick={(e) => { e.preventDefault(); generateRoomId(); }}
                                variant="secondary"
                                className="w-full"
                                icon={Zap}
                            >
                                Generate New Room
                            </Button>

                        </form>
                    </div>

                    <div className="features-grid">
                        <div className="feature-item">
                            <Terminal size={16} />
                            <span>Low Latency</span>
                        </div>
                        <div className="feature-item">
                            <Users size={16} />
                            <span>Multiplayer</span>
                        </div>
                        <div className="feature-item">
                            <p>{'<>'}</p>
                            <span>Syntax Highlighting</span>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

const Home = ({updateUsername}) => {
    const navigate = useNavigate();
    const handleJoin = (username, roomId) => {
        console.log(`This would join room ${roomId} as ${username}`);
        updateUsername(username);
        navigate(`/editor?roomid=${roomId}`);
    };

    return (
        <>
            <LandingPage onJoin={handleJoin} />
        </>
    );
};

export default Home;