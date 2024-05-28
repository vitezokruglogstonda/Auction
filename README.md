# Auction
Web app for auction
======
-Requirements:
    -ASP.NET Core 8.0
    -Angular 17.0.10
    -Node.JS 20.9.0
    -npm 10.1.0
    -postgres 16 (and pgAdmin 4)
    -redis
-Setup:
    -In angular application run command: npm install
    -In .NET application install NuGet packages:
        -Hangfire (1.8.12)
        -Hangfire.Redis.StackExchange (1.9.3)
        -Microsoft.AspNetCore.SignalR (1.1.0)
        -Microsoft.EntityFrameworkCore (8.0.1)
        -Microsoft.EntityFrameworkCore.Design (8.0.1)
        -Microsoft.IdentityModel.Tokens (7.2.0)
        -Newtonsoft.Json (13.0.3)
        -Npgsql.EntityFrameworkCore.PostgreSQL (8.0.0)
        -Npgsql.EntityFrameworkCore.PostgreSQL.Design (1.1.0)
        -StackExchange.Redis (2.7.17)
        -System.IdentityModel.TokensJwt (7.2.0)
-Making docker image:
    -For client app, run following commands:
        docker build -t auction-client .
        docker run --name AuctionClient -p 4200:4200 auction-client
    -For server, redis cache and postgres database:
        -create SSL certificate:
			-for windows:
				dotnet dev-certs https --clean
				dotnet dev-certs https -ep %USERPROFILE%\.aspnet\https\aspnetapp.pfx -p test
				dotnet dev-certs https --trust
			-for linux:
				dotnet dev-certs https --clean
				dotnet dev-certs https -ep ${HOME}/.aspnet/https/aspnetapp.pfx -p test
				dotnet dev-certs https --trust
        -create and run docker images (you must first navigate to the project directory):
            docker compose up --build
        -insert a auctiondb.sql file into postgres container with following commands:
            docker cp auctiondb.sql auction.database:/auctiondb.sql   
            docker exec -it auction.database psql -U postgres -d AuctionDB -f /auctiondb.sql
-Starting app (without docker):
    -First run redis (port: 6379) and postgres database (port: 5432)
        -credentials for db are in the appsettings.json file on server
    -Server build&run command: dotnet run
    -Client build&run command: ng serve
