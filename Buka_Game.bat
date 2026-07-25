@echo off
title EcoHero 3D - HIMA TI Pengabdian Masyarakat
echo ========================================================
echo   EcoHero 3D - Game Pemilahan Sampah Interaktif
echo   HIMA TI Pengabdian Masyarakat
echo ========================================================
echo.
echo   Memulai server lokal dan membuka game di browser...
echo   (Jangan tutup jendela ini saat bermain!)
echo.

:: Check if Python is available
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo   Server berjalan di http://localhost:8000
    echo   Tekan Ctrl+C untuk menghentikan server.
    echo.
    start "" "http://localhost:8000"
    cd /d "%~dp0"
    python -m http.server 8000
) else (
    echo   Python tidak ditemukan, membuka langsung...
    echo   (Beberapa model 3D mungkin tidak tampil di Chrome)
    start "" "%~dp0index.html"
)
