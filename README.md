# **Auction**
---
## Overview
The **Auction** is a web-based application implemented in ASP.NET Core and Angular, designed to facilitate online auctions, allowing users to create, manage, and participate in bidding events. The platform provides a seamless and intuitive experience for both buyers and sellers, ensuring transparency and fair competition.
---
## Features:
    - Creating an account
    - Login/Logout
    - Managing account, adding money to the balance
    - Viewing, searching and filtering articles
    - Publishing articles
    - Real-time biding
    - Notifications
    - Email notifications
---
## Tech stack
    - Angular
    - NgRx
    - ASP.NET Core
    - EF Core
    - Redis
    - PostgreSQL
    - Hangfire
    - SignalR
---
- Requirements:
    - ASP.NET Core 8.0
    - Angular 17.0.10
    - Node.JS 20.9.0
    - npm 10.1.0
    - postgres 16 (and pgAdmin 4)
    - redis
- Setup:
    -In angular application run command:
    ```bash
    npm install
    ```
- Making docker image:
    - For client app, run following commands:
        ```bash
        docker build -t auction-client .
        ```
        ```bash
        docker run --name AuctionClient -p 4200:4200 auction-client
        ```
    - For server, redis cache and postgres database:
        - create SSL certificate:
			- for windows:
                ```bash
				dotnet dev-certs https --clean
                ```
                ```bash
				dotnet dev-certs https -ep %USERPROFILE%\.aspnet\https\aspnetapp.pfx -p test
                ```
                ```bash
				dotnet dev-certs https --trust
                ```
			- for linux:
                ```bash
				dotnet dev-certs https --clean
                ```
                ```bash
				dotnet dev-certs https -ep ${HOME}/.aspnet/https/aspnetapp.pfx -p test
                ```
                ```bash
				dotnet dev-certs https --trust
                ```
        - create and run docker images (you must first navigate to the project directory):
            ```bash
            docker compose up --build
            ```
        - insert a auctiondb.sql file into postgres container with following commands:
            ```bash
            docker cp auctiondb.sql auction.database:/auctiondb.sql
            ```   
            ```bash
            docker exec -it auction.database psql -U postgres -d AuctionDB -f /auctiondb.sql
            ```
- Starting app (without docker):
    - First run redis (port: 6379) and postgres database (port: 5432)
        -credentials for db are in the appsettings.json file on server
    - Server build&run command: 
        ```bash
        dotnet run
        ```
    - Client build&run command: 
        ```bash
        ng serve
        ```
