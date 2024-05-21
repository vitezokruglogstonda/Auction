# Auction
Web app for auction
======
-Requirements:
    -ASP.NET Core 8.0
    -Angular 17.0.10
    -Node.JS 20.9.0
    -npm 10.1.0
    -postgres 16 (and pgAdmin 4)
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
    -
-Starting app:
    -First run redis (port: 6379) and postgres database (port: 5432)
        -credentials for db are in the appsettings.json file on server
    -Server build&run command: dotnet run
    -Client build&run command: ng serve
