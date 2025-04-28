#!/bin/bash

show_menu() {
  echo "Wybierz opcję:"
}

run_backend() {
  echo "Uruchamianie backendu..."
  cd backend || { echo "Nie można przejść do katalogu backend"; return; }
  yarn start:dev
  cd - > /dev/null
}

run_frontend() {
  echo "Uruchamianie frontendu..."
  cd frontend || { echo "Nie można przejść do katalogu frontend"; return; }
  yarn dev
  cd - > /dev/null
}

run_database_container() {
  echo "Uruchamianie kontenera z bazą danych..."
  docker-compose up -d
}

create_migration() {
  echo -n "Podaj nazwę migracji: "
  read migration_name
  npm run typeorm migration:generate -- -n "$migration_name"
}

run_migrations() {
  echo "Uruchamianie migracji..."
  npm run typeorm migration:run
}

revert_migration() {
  echo "Cofanie migracji..."
  npm run typeorm migration:revert
}

while true; do
  show_menu
  PS3="Wybierz opcję (1-7): "
  options=("Uruchom backend" "Uruchom frontend" "Uruchom kontener z bazą danych" "Utwórz migrację" "Uruchom migracje" "Cofnij migrację" "Wyjdź")
  select opt in "${options[@]}"; do
    case $REPLY in
      1) run_backend; break ;;
      2) run_frontend; break ;;
      3) run_database_container; break ;;
      4) create_migration; break ;;
      5) run_migrations; break ;;
      6) revert_migration; break ;;
      7) echo "Do zobaczenia!"; exit 0 ;;
      *) echo "Nieprawidłowa opcja, spróbuj ponownie." ;;
    esac
  done
done