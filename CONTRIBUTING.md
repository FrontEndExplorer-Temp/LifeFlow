# Contributing to Life Management System

Thank you for considering contributing to the Life Management System! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Check if the feature has been suggested
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   - Ensure all existing tests pass
   - Add new tests for new features
   - Test on multiple platforms (iOS, Android, Web)

5. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
   - Use clear, descriptive commit messages
   - Reference issue numbers if applicable

6. **Push to your fork**
   ```bash
   git push origin feature/AmazingFeature
   ```

7. **Open a Pull Request**
   - Provide a clear description of changes
   - Link related issues
   - Include screenshots for UI changes

## Development Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment
npm run dev
```

### Frontend
```bash
cd mobile-app
npm install
npx expo start
```

## Code Style

### JavaScript/React Native
- Use ES6+ features
- Use functional components with hooks
- Follow React Native best practices
- Use meaningful variable names
- Add JSDoc comments for functions

### File Naming
- Components: PascalCase (e.g., `TaskCard.js`)
- Utilities: camelCase (e.g., `formatDate.js`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_URL`)

### Git Commit Messages
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests

## Project Structure

```
backend/
├── controllers/    # Business logic
├── models/        # Database schemas
├── routes/        # API endpoints
├── middleware/    # Auth, error handling
└── services/      # External services

mobile-app/
├── app/           # Screens and navigation
├── store/         # State management
└── services/      # API and utilities
```

## Testing

- Write unit tests for new features
- Ensure existing tests pass
- Test on multiple platforms
- Test offline functionality

## Documentation

- Update README.md for new features
- Update API_DOCS.md for API changes
- Add inline comments for complex code
- Update CHANGELOG.md

## Questions?

Feel free to open an issue for any questions or clarifications!

Thank you for contributing! 🎉
