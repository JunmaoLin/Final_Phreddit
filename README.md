Add design docs in *images/*

## Instructions to setup and run project
Clearly explain the steps required to install and configure necessary packages,
for both the server and the client, and the sequence of steps required to get
your application running.

### Instructions

#### Getting Started

1. Clone the Repository or Download it through zip file & extract it
2. Once you have the files on your local machine open command prompt and cd into the repository folder
3. Once you are on the repository-folder ***i.e (C:\Users\you\project-folder)***, ***npm install*** to get the top-level dependencies to run jest tests
4. After you npm installed cd into client ***i.e (C:\Users\you\project-folder\client)*** and also ***npm install*** to get the client-sided dependencies to run React
5. cd out of client ***(cd .. )*** and back into the top-level repo-folder ***i.e (C:\Users\you\project-folder)***
6. cd into the server ***i.e (C:\Users\you\project-folder\server)*** and ***npm install*** to get the server-sided dependencies to run express & mongoDB

#### Running Jest Tests

1. ***ASSUMING YOU ARE ON THE TOP-LEVEL REPO-FOLDER***  i.e (C:\Users\you\project-folder)  
Type in the command line ***npm test*** to run the jest unit tests

#### Running the Project

1. Open a new command line and start the mongo database with ***'mongod'*** or ***'mongod --dbpath <path-to-data-directory>'*** if you did not add mongod to your path environment
2. Open a new command line and start the mongoshell with ***'mongosh'***
3. Open a new command line and cd into the server folder of the project folder ***i.e (C:\Users\you\project-folder\server)***
4. Run this command to initialize the database: ***'node init.js mongodb://127.0.0.1:27017/phreddit (admin email of your choosing) (admin name of your choosing) (admin password of your choosing)'***  
***i.e 'node init.js mongodb://127.0.0.1:27017/phreddit test@gmail.com test 1234'***
5. After you have initialized the database go to the mongoshell commandline tab and run ***'show dbs'*** and then ***'use phreddit'***
6. To check the initialized collections run ***'show collections'***
7. To view the actual collections run ***'db.(collection name).find({})'***  
***i.e 'db.comments.find({})'***
8. Go back to the command line where you initialized the database with 'node init.js ...' start the backend server with ***'nodemon server/server.js'***
9. Create a new command line and cd into the client folder of the project folder ***i.e (C:\Users\you\project-folder\client)*** and run ***'npm start***' to start the frontend React Server
10. 'npm start' should bring you to ***http://localhost:3000***, if not click on the link

#### Resetting the Project

1. ASSUMING THE PROJECT IS ALREADY RUNNING AND YOU HAVE YOUR ***5 COMMAND LINE TABS OPEN***  
(Each tab for the following uses: jest testing, running mongoDB, running the backend server, running the frontend React, Using MongoShell (mongosh))
2. Go to the mongosh command line and run the command: ***'db.dropDatabase()'*** and then ***'exit'***
3. Go to the command line in the backend-server folder ***i.e (C:\Users\you\project-folder\server)*** and reinitialize & rerun the backend server from ***STEPS 4-8 in RUNNING THE PROJECT***

#### Cleaning up the Project

1. Go to the command line with the backend server: ***i.e (C:\Users\you\project-folder\server)*** and press ***'ctrl + c'*** to stop the backend server
2. Go to the command line with the mongoshell and and drop the phreddit database with ***'db.dropDatabase()'*** then ***'exit'*** to leave mongoshell
3. Go to the command line with the frontend React client folder: ***i.e (C:\Users\you\project-folder\client)*** and press ***'ctrl + c'*** to stop the frontend React server
4. Go to the command line with mongoDB running and press ***'ctrl + c'*** to stop MongoDB
5. ***YOU HAVE NOW STOPPED EVERY PROCESS AND CAN EXIT ALL OF YOUR TABS ON THE COMMAND LINE***