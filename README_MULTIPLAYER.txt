# Attack on the Coopers Multiplayer

## How to run

1. Install Node.js.
2. Open this folder in VS Code.
3. Open the terminal.
4. Run:

```bash
npm install
npm start
```

5. On the computer running the server, open:

```text
http://localhost:3000?room=coopers
```

6. On another computer on the same Wi-Fi, open:

```text
http://YOUR_IP_ADDRESS:3000?room=coopers
```

Replace `YOUR_IP_ADDRESS` with the IP address of the computer running the server.

## What is synced

- same dungeon seed
- other player positions
- room clears
- mini-boss clears
- final boss progress
- the win condition requiring all 3 final bosses

## Notes

This is co-op multiplayer using a small Node.js WebSocket backend. Do not open `index.html` directly for multiplayer; use the server URL.

## Dungeon levels

As rooms are cleared and bosses are defeated, the dungeon level rises. Enemy HP, damage, speed, projectile pressure, and enemy counts scale upward.

## Boss variants

Every 5 dungeon levels, the final boss changes into a stronger variant: Warden Core, Arc Tyrant, Forge Beast, Void Bishop, and Final Nightmare.
