FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY . ./
RUN dotnet restore "Back/XmasHack.API/XmasHack.API.csproj"
RUN dotnet build "Back/XmasHack.API/XmasHack.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Back/XmasHack.API/XmasHack.API.csproj" -c Release -o /app/publish

FROM base AS final
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV ASPNETCORE_HTTP_PORT=80
ENV ASPNETCORE_GRPC_PORT=82
ENV ASPNETCORE_DEBUG_PORT=84

WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "XmasHack.API.dll"]