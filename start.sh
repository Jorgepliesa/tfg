#!/usr/bin/env zsh

# Levantar proyecto

# Levantar Docker
docker compose up -d
sleep 3

# Levantar backend 
konsole --new-tab --workdir "$PWD/backend" -e zsh -c "
  trap 'echo \"Backend detenido\"; exit 0' INT TERM
  npm run start:dev
  echo \"\nPresiona Enter para cerrar...\"
  read
" &
sleep 1

# Levantar frontend
cd frontend
npx expo start