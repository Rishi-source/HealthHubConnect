package websocket

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID          uint
	Conn        *websocket.Conn
	Send        chan []byte
	UserID      uint
	RecipientID uint
}

type Manager struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	sync.RWMutex
}

func NewManager() *Manager {
	return &Manager{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (m *Manager) Run() {
	for {
		select {
		case client := <-m.register:
			m.Lock()
			m.clients[client] = true
			m.Unlock()

		case client := <-m.unregister:
			if _, ok := m.clients[client]; ok {
				m.Lock()
				delete(m.clients, client)
				close(client.Send)
				m.Unlock()
			}

		case message := <-m.broadcast:
			for client := range m.clients {
				select {
				case client.Send <- message:
				default:
					m.Lock()
					close(client.Send)
					delete(m.clients, client)
					m.Unlock()
				}
			}
		}
	}
}

func (m *Manager) GetClientsByUserID(userID uint) []*Client {
	var clients []*Client
	m.RLock()
	defer m.RUnlock()

	for client := range m.clients {
		if client.UserID == userID {
			clients = append(clients, client)
		}
	}
	return clients
}

func (m *Manager) GetClients() map[*Client]bool {
	m.RLock()
	defer m.RUnlock()
	return m.clients
}

func (m *Manager) Register(client *Client) {
	m.register <- client
}

func (m *Manager) Unregister(client *Client) {
	m.unregister <- client
}

func (m *Manager) Broadcast(message []byte) {
	m.broadcast <- message
}
