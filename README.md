A project to sync Avrae Initiative State with the Owlbear map.

The backend is a simple node application running an `express` API. It communicates with a mongodb database and starts a discord bot using `discord.js`.

The extension is a micro-frontend using `Vue` and the `Owlbear` SDK. It communicates with the backend using `socket.io`.