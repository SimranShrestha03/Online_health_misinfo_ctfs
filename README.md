# COVID Health Misinformation CTF

A comprehensive Capture The Flag (CTF) exercise with 25 challenges designed for graduate students to develop critical thinking skills for identifying and analyzing COVID-19 and health misinformation.

## Overview

This CTF includes:

- **10 original scenarios** from the provided document
- **15 new graduate-level challenges** focusing on advanced critical skills
- **Static website** with modern, accessible design
- **Client-side flag verification** with optional serverless backend
- **Anonymous leaderboard** system
- **Content warnings** for potentially harmful scenarios

## Features

### Challenge Types

- **Image Analysis**: Detect visual manipulation in charts and infographics
- **Text Analysis**: Identify logical fallacies and source credibility issues
- **Video Forensics**: Detect deepfakes and video manipulation
- **Data Analysis**: Apply statistical reasoning and identify confounding variables
- **Source Criticism**: Verify expert credentials and quote authenticity

### Difficulty Levels

- **Easy**: Basic logical fallacies and source criticism
- **Medium**: Statistical manipulation and false equivalence
- **Hard**: Complex conspiracy theories and advanced manipulation
- **Graduate**: Advanced statistical reasoning, causal inference, and algorithmic literacy

### Safety Features

- **Content warnings** for HARMFUL_CONTENT scenarios
- **Educational focus** on detection, not reproduction of harmful content
- **Links to verified sources** (CDC, WHO) for safe alternatives

## Quick Start

### Prerequisites

- Modern web browser with JavaScript enabled
- Local web server (for development) or static hosting service

### Local Development

1. **Clone or download the repository**

   ```bash
   git clone <repository-url>
   cd ctf
   ```

2. **Start a local web server**

   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js (if you have http-server installed)
   npx http-server

   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Adding Real Assets

1. **Replace placeholder files** in the `assets/` folder with actual content
2. **Ensure proper file formats**:

   - Images: PNG, JPG, GIF
   - Videos: MP4, WebM
   - Documents: PDF
   - Data: CSV, JSON
   - Code: IPYNB, PY, R

3. **Test all assets** to ensure they load correctly

## Deployment Options

### Option 1: GitHub Pages (Recommended for Static)

1. **Create a GitHub repository**
2. **Upload all files** to the repository
3. **Enable GitHub Pages** in repository settings
4. **Set source** to main branch
5. **Access your CTF** at `https://yourusername.github.io/repository-name`

### Option 2: Netlify (Recommended for Serverless Features)

1. **Connect your GitHub repository** to Netlify
2. **Set build command**: (leave empty for static site)
3. **Set publish directory**: `/` (root)
4. **Add environment variables** for serverless functions (if using)
5. **Deploy automatically** on every push

### Option 3: Vercel (Alternative Serverless)

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Run**: `vercel` in your project directory
3. **Follow prompts** to configure deployment
4. **Add environment variables** in Vercel dashboard

## Configuration

### Environment Variables (for Serverless Deployment)

Create a `.env` file (not committed to git):

```bash
# Flag verification salt (generate a secure random string)
CTF_SALT=your_secure_random_salt_here

# Individual flag hashes (generate these server-side)
FLAG_HASH_1=sha256_hash_of_flag_1
FLAG_HASH_2=sha256_hash_of_flag_2
# ... etc for all 25 challenges
```

### Admin Access

Access the admin panel at `/admin.html` with the passphrase set in the configuration.

## Security Considerations

### Current Implementation (Client-Side)

- **Obfuscation only** - flags are visible in source code
- **No rate limiting** - unlimited submission attempts
- **Suitable for educational use** with trusted participants

### Production Security (Recommended)

- **Server-side flag verification** using serverless functions
- **Rate limiting** to prevent brute force attacks
- **Environment variables** for sensitive data
- **HTTPS enforcement**

See `security_notes.md` for detailed security guidance.

## Customization

### Adding New Challenges

1. **Edit `ctf_dataset.json`**
2. **Add challenge object** with all required fields:

   ```json
   {
     "id": 26,
     "title": "Your Challenge Title",
     "type": "image|text|video|twitter_screenshot|datafile|mixed",
     "difficulty": "easy|medium|hard|graduate",
     "learning_objective": "One sentence description",
     "prompt_text": "Full challenge description",
     "assets": ["filename1.png", "filename2.mp4"],
     "hints": ["Hint 1", "Hint 2", "Hint 3"],
     "flag": "flag{your_flag_here}",
     "explanation": "Full solution explanation",
     "tags": ["tag1", "tag2"],
     "safety": "safe|HARMFUL_CONTENT"
   }
   ```

3. **Add assets** to the `assets/` folder
4. **Update the assets list** in the JSON metadata

### Modifying Styling

Edit `styles.css` to customize:

- Color scheme
- Typography
- Layout
- Responsive design
- Accessibility features

### Adding Features

The modular JavaScript architecture in `app.js` makes it easy to add:

- New challenge types
- Additional hint systems
- Custom scoring mechanisms
- Integration with external APIs

## Testing

### Manual Testing Checklist

- [ ] All challenges load correctly
- [ ] Flag verification works for all challenges
- [ ] Hints reveal after incorrect attempts
- [ ] HARMFUL_CONTENT warnings display properly
- [ ] Leaderboard updates correctly
- [ ] Responsive design works on mobile
- [ ] Accessibility features function properly

### Automated Testing (Optional)

Run the included test suite:

```bash
# If using Node.js
npm test

# Or run individual test files
node tests/flag_verification.test.js
```

## Troubleshooting

### Common Issues

1. **Assets not loading**

   - Check file paths in `assets/` folder
   - Ensure proper file permissions
   - Verify file formats are supported

2. **Flag verification not working**

   - Check browser console for JavaScript errors
   - Verify flag format matches expected pattern
   - Test with known correct flags

3. **Styling issues**

   - Clear browser cache
   - Check CSS file is loading
   - Verify responsive design breakpoints

4. **Performance issues**
   - Optimize large image/video files
   - Use lazy loading for assets
   - Consider CDN for static assets

### Browser Compatibility

- **Modern browsers** (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- **JavaScript required** for full functionality
- **WebCrypto API** required for flag hashing
- **Local Storage** required for leaderboard

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- Use consistent indentation (2 spaces)
- Comment complex JavaScript functions
- Follow accessibility guidelines
- Test on multiple browsers

## License

This project is for educational use only. The CTF scenarios are designed to teach critical thinking skills and should not be used to spread misinformation.

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review the security notes
3. Create an issue in the repository
4. Contact the development team

## Acknowledgments

- Original 10 scenarios from the provided CTF document
- Graduate-level challenges designed for advanced critical thinking
- Accessibility features based on WCAG 2.1 guidelines
- Security practices from OWASP recommendations

---

**Remember**: This CTF is designed for educational purposes. Always verify information with reliable sources like CDC, WHO, and peer-reviewed scientific literature.
