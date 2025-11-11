#!/bin/bash

# Script para atualizar automaticamente o IP no arquivo de configuração
# Uso: ./update-ip.sh

echo "🔍 Detectando IP da máquina..."

# Detecta o IP da máquina (exclui localhost)
NEW_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$NEW_IP" ]; then
    echo "❌ Erro: Não foi possível detectar o IP da máquina"
    exit 1
fi

echo "✅ IP detectado: $NEW_IP"

# Arquivo de configuração
CONFIG_FILE="config/env.ts"

# Verifica se o arquivo existe
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Erro: Arquivo $CONFIG_FILE não encontrado"
    exit 1
fi

# Extrai o IP atual do arquivo
CURRENT_IP=$(grep -o "http://[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+:3232" "$CONFIG_FILE" | head -1 | sed 's/http:\/\///' | sed 's/:3232//')

if [ -z "$CURRENT_IP" ]; then
    echo "❌ Erro: Não foi possível encontrar o IP atual no arquivo"
    exit 1
fi

echo "📝 IP atual no arquivo: $CURRENT_IP"

# Verifica se o IP mudou
if [ "$CURRENT_IP" = "$NEW_IP" ]; then
    echo "✅ IP já está atualizado! Nada a fazer."
    exit 0
fi

echo "🔄 Atualizando IP de $CURRENT_IP para $NEW_IP..."

# Atualiza o IP no arquivo (macOS compatible)
sed -i '' "s/$CURRENT_IP/$NEW_IP/g" "$CONFIG_FILE"

echo "✅ IP atualizado com sucesso!"
echo ""
echo "📱 Próximos passos:"
echo "1. Reinicie o servidor Expo: npm start"
echo "2. Escaneie o QR code novamente no Expo Go"
echo "3. Teste a conexão com a API"
