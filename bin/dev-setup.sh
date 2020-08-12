#!/bin/bash

# Set variables
COMPOSE_FILE=""

echo "Logging into ACR..."
az acr login --name hmctspublic --subscription DCD-CNP-Prod
az acr login --name hmctsprivate --subscription DCD-CNP-Prod

echo "Pulling docker images..."
docker-compose ${COMPOSE_FILE} pull
docker-compose ${COMPOSE_FILE} build

echo "Starting databases..."
docker-compose ${COMPOSE_FILE} up -d shared-db shared-database

echo "Starting ForgeRock..."
docker-compose ${COMPOSE_FILE} up -d fr-am fr-idm

echo "Starting IDAM..."
docker-compose ${COMPOSE_FILE} up -d sidam-api

# Set up IDAM client with services and roles
echo "Setting up IDAM client..."
until curl http://localhost:5000/health
do
  echo "Waiting for IDAM";
  sleep 10;
done

./bin/idam-client-setup.sh

# Start all other images
echo "Starting dependencies..."
docker-compose ${COMPOSE_FILE} up -d fees-api ccd-data-store-api ccd-definition-store-api ccd-elasticsearch

# Set up missing Fees keyword
echo "Setting up Feeds keyword"
until psql -h localhost --username postgres -d fees_register -p 5050 -c "UPDATE public.fee SET keyword = 'NewFee' WHERE code = 'FEE0003'";
do
  echo "Retrying";
  sleep 15;
done

# Fees API migrations appear to be broken so it fails to boot first time round
docker-compose ${COMPOSE_FILE} restart fees-api

echo "Setting up CCD roles..."
until curl http://localhost:4451/health
do
  echo "Waiting for CCD";
  sleep 10;
done

./bin/ccd-add-all-roles.sh
./ccdImports/conversionScripts/createAllXLS.sh probate-back-office:4104
./ccdImports/conversionScripts/importAllXLS.sh

docker-compose ${COMPOSE_FILE} stop

echo "LOCAL ENVIRONMENT SUCCESSFULLY CREATED"
echo "Now run with ./bin/dev-start.sh"
