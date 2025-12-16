# 🤝 Contributing to Active Sports Management

Thank you for considering contributing to this project!

## 📋 Getting Started

### Fork and Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/active-sports-management.git
cd active-sports-management

# Add upstream remote
git remote add upstream https://github.com/arpanroy41/active-sports-management.git
```

### Setup Development Environment

```bash
npm install
# Setup .env with your Supabase credentials
npm run dev
```

## 💻 Development Process

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write clear, concise code
- Follow existing code style
- Add comments for complex logic

### 3. Test Your Changes

```bash
npm run lint
npm run build
```

### 4. Commit Changes

```bash
git commit -m "feat: add player search functionality"

# Commit types:
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code restructuring
```

## 🔄 Pull Request Process

1. Push to your fork
2. Create Pull Request on GitHub
3. Fill in PR template
4. Wait for review

## 📏 Coding Standards

### React Components

```javascript
// Use functional components
const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);

  if (!data) return <Spinner />;

  return <div>Content</div>;
};

export default MyComponent;
```

### File Naming

- Components: `PascalCase.jsx`
- Utils: `camelCase.js`
- Pages: `PascalCase.jsx`

## 🧪 Testing

Manual testing checklist:
- [ ] Authentication works
- [ ] Admin features work
- [ ] Player features work
- [ ] Responsive design
- [ ] Browser compatibility

## 📚 Documentation

Update relevant docs when:
- Adding new features
- Changing APIs
- Modifying setup process

## 💡 Good First Issues

Look for issues labeled:
- `good first issue`
- `help wanted`
- `documentation`

## 🐛 Bug Reports

Include:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots
- Browser/OS info
- Console errors

## 📞 Getting Help

- GitHub Discussions
- GitHub Issues
- Email: arpanroy41@gmail.com

## 📜 License

By contributing, you agree your contributions will be licensed under MIT License.

---

Thank you for contributing! 🙌
