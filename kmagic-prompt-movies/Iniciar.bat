@echo off
title K-Magic Prompt - Movies
cd /d "%~dp0"

echo.
echo  ==========================================
echo   K-Magic Prompt - Movies
echo  ==========================================
echo.

:: --- Associar .js ao Node.js (evita dialogo "abrir com") ---
for /f "delims=" %%i in ('where node 2^>nul') do set "NODEPATH=%%i"
if defined NODEPATH (
    reg query "HKCU\Software\Classes\.js" >nul 2>&1
    if errorlevel 1 (
        reg add "HKCU\Software\Classes\.js" /ve /d "NodeJSScript" /f >nul 2>&1
        reg add "HKCU\Software\Classes\NodeJSScript" /ve /d "Node.js Script" /f >nul 2>&1
        reg add "HKCU\Software\Classes\NodeJSScript\shell\open\command" /ve /d "\"%NODEPATH%\" \"%%1\" %%*" /f >nul 2>&1
    )
)

:: --- Ollama ---
curl -s --max-time 2 http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo  [Ollama] A iniciar em background...
    start /b "" ollama serve >nul 2>&1
    ping -n 4 127.0.0.1 >nul
) else (
    echo  [Ollama] Ja esta a correr.
)

:: --- Build via caminho curto (evita limite MAX_PATH do Windows) ---
echo.
echo  [Build] A compilar versao mais recente...
set "TMPBUILD=C:\Temp\km"
if not exist "%TMPBUILD%" mkdir "%TMPBUILD%"
copy /y "package.json" "%TMPBUILD%\" >nul
copy /y "package-lock.json" "%TMPBUILD%\" >nul
copy /y "index.html" "%TMPBUILD%\" >nul
copy /y "vite.config.js" "%TMPBUILD%\" >nul
copy /y "tailwind.config.js" "%TMPBUILD%\" >nul
copy /y "postcss.config.js" "%TMPBUILD%\" >nul
if exist "%TMPBUILD%\src" rmdir /s /q "%TMPBUILD%\src"
xcopy /e /i /q "src" "%TMPBUILD%\src" >nul
if exist "%TMPBUILD%\public" rmdir /s /q "%TMPBUILD%\public"
xcopy /e /i /q "public" "%TMPBUILD%\public" >nul
if not exist "%TMPBUILD%\node_modules\.bin\vite.cmd" (
    echo  [npm] A instalar dependencias em caminho curto...
    pushd "%TMPBUILD%"
    call npm install
    popd
    if errorlevel 1 ( echo  ERRO nas dependencias. & pause & exit /b 1 )
)
pushd "%TMPBUILD%"
call npm run build
popd
if errorlevel 1 ( echo  ERRO na compilacao. & pause & exit /b 1 )
if exist "dist" rmdir /s /q "dist"
xcopy /e /i /q "%TMPBUILD%\dist" "dist" >nul

:: --- Libertar porto 5173 ---
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 "') do (
    taskkill /f /pid %%a >nul 2>&1
)

:: --- Iniciar servidor em janela separada ---
start "K-Magic Server" cmd /c "node server.cjs & pause"

:: --- Aguardar e abrir browser ---
ping -n 3 127.0.0.1 >nul
start "" "http://localhost:5173"

exit
