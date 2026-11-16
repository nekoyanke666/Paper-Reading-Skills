@echo off
node "%~dp0.paper-map\map-server.cjs" --root "%~dp0." --open
if errorlevel 1 pause
