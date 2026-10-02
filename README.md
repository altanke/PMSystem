# PM System — Система управления проектами и рисками

Распределенная информационная система для управления проектами, задачами, ресурсами команды и проектными рисками. Включает матрицу оценки рисков, ролевой доступ, аналитический дашборд, календарное планирование и экспорт отчетности.

---

## 🚀 Основные возможности

- **Управление проектами и задачами**: создание, назначение исполнителей, отслеживание дедлайнов и статусов реализации.
- **Управление рисками (Risk Management)**: выявление рисков, оценка по матрице «вероятность / воздействие», разработка стратегий реагирования и митигации.
- **Управление ресурсами**: распределение участников команды, загрузка и учет занятости.
- **Аутентификация и безопасность**: JWT-аутентификация, интеграция с Google OAuth2, разграничение прав по ролям (ADMIN, PROJECT_MANAGER, USER).
- **Аналитика и экспорт**: дашборд ключевых показателей, календарь событий, генерация отчетов в формате PDF.

---

## 🛠 Стек технологий

- **Backend**:
  - Java 21
  - Spring Boot 3.2 (Spring Data JPA, Spring Security, Spring Web)
  - Liquibase (версионирование и миграции базы данных)
  - Springdoc OpenAPI / Swagger UI
  - MapStruct, Lombok
- **Frontend**:
  - React 19, TypeScript
  - Vite
  - Tailwind CSS
  - Lucide React (иконки)
  - jsPDF / jsPDF-AutoTable (экспорт отчетов)
- **База данных и кэширование**:
  - PostgreSQL 15
  - Redis 7
- **Инфраструктура и контейнеризация**:
  - Docker, Docker Compose
  - Nginx (раздача статики фронтенда)

---

## 📁 Структура проекта

```text
PM_System/
├── backend/                  # Серверная часть (Spring Boot)
│   ├── src/main/java/        # Исходный код бэкенда
│   ├── src/main/resources/   # Конфигурация и миграции Liquibase
│   ├── Dockerfile            # Multi-stage сборка бэкенда
│   └── build.gradle          # Скрипт сборки Gradle
├── frontend/                 # Клиентская часть (React + Vite)
│   ├── src/                  # Компоненты, страницы, стили, API
│   ├── Dockerfile            # Multi-stage сборка фронтенда с Nginx
│   └── package.json          # Зависимости и скрипты npm
├── docker-compose.yml        # Оркестрация сервисов (БД, Redis, API, UI)
├── .gitignore                # Исключения для Git
└── README.md                 # Документация проекта
```

---

## 🐳 Запуск через Docker Compose

### Предварительные требования

- Установленный [Docker](https://docs.docker.com/get-docker/) и [Docker Compose](https://docs.docker.com/compose/).

### Шаги для запуска

1. **Клонируйте репозиторий:**
   ```bash
   git clone https://github.com/altanke/PMSystem.git
   cd PMSystem
   ```

2. **Соберите и запустите контейнеры:**
   ```bash
   docker compose up --build -d
   ```

3. **Сервисы будут доступны по следующим адресам:**
   - **Frontend (Web UI)**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8080](http://localhost:8080)
   - **Swagger UI (документация API)**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
   - **PostgreSQL**: `localhost:5433` (база данных `pms_db`, пользователь `pms_user`)
   - **Redis**: `localhost:6379`

4. **Остановка контейнеров:**
   ```bash
   docker compose down
   ```
   *(Для удаления сохраненных томов БД используйте `docker compose down -v`)*

---

## 💻 Локальный запуск для разработки

### Backend

```bash
cd backend
./gradlew bootRun
```
*Сервер запустится на порту `8081` (или в соответствии с `application.yml`).*

### Frontend

```bash
cd frontend
npm install
npm run dev
```
*Клиент запустится локально на [http://localhost:5173](http://localhost:5173).*
