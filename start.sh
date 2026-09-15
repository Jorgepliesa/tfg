#!/usr/bin/env zsh

# Detectar IP activa de la red automáticamente (WiFi dinámica, IP fija 155.210.149.42, etc.)
DETECTED_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || hostname -I | awk '{print $1}')

if [ -n "$DETECTED_IP" ]; then
  echo "📡 IP detectada automáticamente: http://${DETECTED_IP}:3000"
  export EXPO_PUBLIC_API_URL="http://${DETECTED_IP}:3000"
  
  if [ -f "frontend/.env" ]; then
    sed -i -E "s|^[[:space:]]*EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=http://${DETECTED_IP}:3000|g" frontend/.env
  fi
else
  echo "⚠️ No se pudo detectar la IP automáticamente."
fi

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