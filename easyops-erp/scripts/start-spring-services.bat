@echo off
REM EasyOps ERP - Windows Spring Boot launcher
REM Mirrors start-spring-services.sh for Git Bash/Command Prompt users.

setlocal enabledelayedexpansion

REM --- Resolve repository root -------------------------------------------------
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "ROOT_DIR=%%~fI"

REM --- Maven wrapper -----------------------------------------------------------
if not defined MAVEN_CMD (
  if exist "%ROOT_DIR%\mvnw.cmd" (
    set "MAVEN_CMD=%ROOT_DIR%\mvnw.cmd"
  ) else (
    set "MAVEN_CMD=%ROOT_DIR%\mvnw"
  )
)

REM --- Active Spring profile ---------------------------------------------------
if not defined SPRING_PROFILE (
  set "SPRING_PROFILE=local"
)
set "PROFILE=%SPRING_PROFILE%"

REM --- Log directory -----------------------------------------------------------
if not defined LOG_DIR (
  set "LOG_DIR=%ROOT_DIR%\logs\local-services"
)
set "PID_DIR=%LOG_DIR%\pids"

REM --- Default logging pattern -------------------------------------------------
set "DEFAULT_LOGGING_PATTERN_CONSOLE=%%d{yyyy-MM-dd HH:mm:ss.SSS} [%%thread] %%-5level %%logger{36} - %%msg%%n"
set "DEFAULT_LOGGING_PATTERN_FILE=%%d{yyyy-MM-dd HH:mm:ss.SSS} [%%thread] %%-5level %%logger{36} - %%msg%%n"

if not defined LOGGING_PATTERN_CONSOLE (
  set "LOGGING_PATTERN_CONSOLE=%DEFAULT_LOGGING_PATTERN_CONSOLE%"
)
if not defined LOGGING_PATTERN_FILE (
  set "LOGGING_PATTERN_FILE=%DEFAULT_LOGGING_PATTERN_FILE%"
)

if not exist "%LOG_DIR%" (
  mkdir "%LOG_DIR%"
)
if not exist "%PID_DIR%" (
  mkdir "%PID_DIR%"
)

REM --- Eureka hostname resolution ----------------------------------------------
if not defined EUREKA_INSTANCE_HOSTNAME (
  set "EUREKA_INSTANCE_HOSTNAME=host.docker.internal"
)
set "EUREKA_INSTANCE_PREFER_IP_ADDRESS=false"

ping -n 1 %EUREKA_INSTANCE_HOSTNAME% >nul 2>&1
if errorlevel 1 (
  for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /c:"IPv4 Address" /c:"IPv4-Adresse"') do (
    for /f "tokens=1,* delims= " %%B in ("%%A") do (
      if not defined HOST_IP (
        set "HOST_IP=%%C"
      )
    )
  )
  if defined HOST_IP (
    set "HOST_IP=%HOST_IP: =%"
    set "EUREKA_INSTANCE_HOSTNAME=%HOST_IP%"
    set "EUREKA_INSTANCE_PREFER_IP_ADDRESS=true"
    echo [INFO] host.docker.internal not reachable, using %HOST_IP% for Eureka registrations.
  ) else (
    echo [WARN] Unable to resolve host.docker.internal and no fallback IP detected.
  )
)

REM --- Service list ------------------------------------------------------------
set "DEFAULT_SERVICES=user-management auth-service rbac-service organization-service notification-service monitoring-service accounting-service ar-service ap-service bank-service sales-service inventory-service purchase-service crm-service hr-service manufacturing-service"

if defined SERVICES_OVERRIDE (
  set "SERVICES=%SERVICES_OVERRIDE:,= %"
) else (
  set "SERVICES=%DEFAULT_SERVICES%"
)

REM --- Maven wrapper bootstrap -------------------------------------------------
echo ============================================================
echo   EasyOps ERP Spring Boot Launcher (Windows)
echo ------------------------------------------------------------
echo   Root directory : %ROOT_DIR%
echo   Maven command  : %MAVEN_CMD%
echo   Spring profile : %PROFILE%
echo   Log directory  : %LOG_DIR%
echo   Services       : %SERVICES%
echo ============================================================
echo.

pushd "%ROOT_DIR%" >nul
call "%MAVEN_CMD%" -N -q --version >nul 2>&1
if errorlevel 1 (
  call "%MAVEN_CMD%" -N --version >nul 2>&1
)
popd >nul

REM --- Launch each service -----------------------------------------------------
for %%S in (%SERVICES%) do (
  set "SERVICE=%%~S"
  set "MODULE_DIR=%ROOT_DIR%\services\!SERVICE!"
  if exist "!MODULE_DIR!\pom.xml" (
    set "LOG_FILE=%LOG_DIR%\!SERVICE!.log"
    echo [START] !SERVICE!  (profile=%PROFILE%)
    echo          log: !LOG_FILE!

    start "easyops-!SERVICE!" /b cmd /c ^
      "cd /d ""!MODULE_DIR!"" && ^
       set SPRING_PROFILES_ACTIVE=%PROFILE% && ^
       call ""%MAVEN_CMD%"" clean >nul 2>&1 && ^
       ""%MAVEN_CMD%"" spring-boot:run ^
         -Dspring-boot.run.profiles=%PROFILE% ^
         -DskipTests=true ^
         -Deureka.instance.hostname=%EUREKA_INSTANCE_HOSTNAME% ^
         -Deureka.instance.preferIpAddress=%EUREKA_INSTANCE_PREFER_IP_ADDRESS% ^
         %SPRING_BOOT_EXTRAS% ^
         >> ""!LOG_FILE!"" 2>&1"

    if errorlevel 1 (
      echo [ERROR] Failed to launch !SERVICE!  (see !LOG_FILE!)
    ) else (
      echo [OK]    !SERVICE! launch command issued.
    )
  ) else (
    echo [SKIP]   !SERVICE! (module directory not found)
  )
)

echo.
echo All services launched in the background.
echo Check log files under %LOG_DIR% for startup progress.
echo Press Ctrl+C to exit this script (services continue to run).

endlocal

