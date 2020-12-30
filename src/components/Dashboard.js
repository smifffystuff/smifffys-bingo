import React, { useState, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button, Card, Alert, ListGroup, Modal, Form } from 'react-bootstrap';

import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import { useFunctions } from '../context/FunctionsContext';

const Dashboard = () => {
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [oneLine, setOneLine] = useState(true);
  const [twoLines, setTwoLines] = useState(true);
  const [fullHouse, setFullHouse] = useState(true);

  const history = useHistory();

  const gameNameRef = useRef();
  const cardColorRef = useRef();

  const { currentUser, logout } = useAuth();
  const { games } = useDatabase();
  const { createNewGame, joinGame, leaveGame, startGame } = useFunctions();

  const handleLogout = async () => {
    setError('');
    try {
      await logout();
      history.push('/login');
    } catch {
      setError('Failed to log out');
    }
  };

  const handleCreateGame = async () => {
    try {
      console.log(oneLine, twoLines, fullHouse);
      await createNewGame({
        name: gameNameRef.current.value,
        color: cardColorRef.current.value,
        oneLine,
        twoLines,
        fullHouse,
      });
      setShowModal(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleJoinGame = async game => {
    try {
      if (currentUser.uid === game.owner) {
        await startGame(game.id);
        history.push('/call-game');
      } else {
        await joinGame(game.id);
        history.push('/join-game');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLeaveGame = async gameId => {
    try {
      await leaveGame(gameId);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Game Name</Form.Label>
            <Form.Control type="text" ref={gameNameRef} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Card Color</Form.Label>
            <Form.Control as="select" ref={cardColorRef}>
              <option
                style={{ backgroundColor: 'blueviolet' }}
                value="blueviolet"
              >
                Purple
              </option>
              <option
                style={{ backgroundColor: 'lightgreen' }}
                value="lightgreen"
              >
                Green
              </option>
              <option
                style={{ backgroundColor: 'lightslategray' }}
                value="lightslategray"
              >
                Gray
              </option>
              <option style={{ backgroundColor: 'orange' }} value="orange">
                Orange
              </option>
              <option
                style={{ backgroundColor: 'palegoldenrod' }}
                value="palegoldenrod"
              >
                Yellow
              </option>
            </Form.Control>
          </Form.Group>
          <Form.Check
            type="checkbox"
            label="One Line"
            defaultChecked={oneLine}
            onChange={e => setOneLine(e.currentTarget.checked)}
          />
          <Form.Check
            type="checkbox"
            label="Two Lines"
            defaultChecked={twoLines}
            onChange={e => setTwoLines(e.currentTarget.checked)}
          />
          <Form.Check
            type="checkbox"
            label="Full House"
            defaultChecked={fullHouse}
            onChange={e => setFullHouse(e.currentTarget.checked)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCreateGame}>
            Create New Game
          </Button>
        </Modal.Footer>
      </Modal>
      <Card>
        <Card.Body>
          <h2>Current Games</h2>
          <ListGroup>
            {games.map(game => (
              <ListGroup.Item
                key={game.id}
                className="d-flex flex-row justify-content-between align-items-center"
              >
                {game.name} ({game.players.length})
                <Button variant="link" onClick={() => handleJoinGame(game)}>
                  {currentUser.uid === game.owner
                    ? 'Start Game'
                    : game.inProgress && 'Join Game'}
                </Button>
                <Button variant="link" onClick={() => handleLeaveGame(game.id)}>
                  Leave Game
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <div className="text-center w-100">
            <Button className="mt-4" variant="link" onClick={handleShowModal}>
              Create New Game
            </Button>
          </div>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Profile</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <strong>Nickname:</strong> {currentUser.displayName}
          <Link to="/update-profile" className="btn btn-primary w-100 mt-3">
            Update Profile
          </Link>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </>
  );
};

export default Dashboard;
