# Security Notes for CTF Implementation

## Flag Security and Hashing

### Current Implementation (Client-Side Hashing)

The current implementation uses client-side SHA-256 hashing with a salt for flag verification. This provides **obfuscation only**, not true security.

```javascript
// Current approach (app.js)
const salt = "ctf_salt_2025_secure_random_string";
const hash = await crypto.subtle.digest("SHA-256", encoder.encode(salt + flag));
```

### Security Limitations

- **Client-side hashing is not secure** - users can inspect the JavaScript and extract the salt
- **Flags are visible in the JSON dataset** - anyone can read the source code
- **No rate limiting** - users can attempt unlimited flag submissions
- **No server-side validation** - all verification happens in the browser

### Recommended Security Improvements

#### 1. Server-Side Flag Verification

For production use, implement server-side flag verification:

```javascript
// Serverless function example (Netlify/Vercel)
export async function handler(event) {
  const { flag, challengeId } = JSON.parse(event.body);

  // Server-side flag verification
  const correctFlag = getFlagFromSecureStorage(challengeId);
  const isValid = await verifyFlag(flag, correctFlag);

  return {
    statusCode: 200,
    body: JSON.stringify({ valid: isValid }),
  };
}
```

#### 2. Environment Variables for Secrets

Store sensitive data in environment variables:

```bash
# .env (not committed to git)
CTF_SALT=your_secure_random_salt_here
FLAG_HASH_1=sha256_hash_of_flag_1
FLAG_HASH_2=sha256_hash_of_flag_2
# ... etc
```

#### 3. Rate Limiting

Implement rate limiting to prevent brute force attacks:

```javascript
// Example rate limiting
const rateLimit = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip) {
  const now = Date.now();
  const attempts = rateLimit.get(ip) || [];
  const recentAttempts = attempts.filter((time) => now - time < WINDOW_MS);

  if (recentAttempts.length >= MAX_ATTEMPTS) {
    throw new Error("Rate limit exceeded");
  }

  recentAttempts.push(now);
  rateLimit.set(ip, recentAttempts);
}
```

## Flag Management Best Practices

### 1. Flag Generation

- Use cryptographically secure random generators
- Avoid predictable patterns
- Use consistent format: `flag{descriptive_token}`
- Keep flags reasonably short but not guessable

### 2. Flag Storage

- **Never store plaintext flags in public repositories**
- Use environment variables or secure key management
- Consider using a secrets management service (AWS Secrets Manager, Azure Key Vault, etc.)

### 3. Flag Rotation

- Implement a system to rotate flags if compromised
- Maintain audit logs of flag submissions
- Have a process to update flags without breaking the CTF

## Deployment Security

### 1. Static Site Deployment

For GitHub Pages or similar static hosting:

- Use environment variables for build-time flag hashing
- Implement client-side rate limiting (limited effectiveness)
- Consider using a CDN with security features

### 2. Serverless Deployment

For Netlify Functions or Vercel:

- Implement proper server-side validation
- Use environment variables for secrets
- Add rate limiting and IP blocking
- Monitor for suspicious activity

### 3. Database Security

If using a database for leaderboards:

- Use parameterized queries to prevent SQL injection
- Implement proper access controls
- Encrypt sensitive data at rest
- Regular security audits

## Content Security Policy (CSP)

Add CSP headers to prevent XSS attacks:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self';"
/>
```

## Privacy Considerations

### 1. Data Collection

- **Minimize data collection** - only collect what's necessary
- **Anonymize user data** - use pseudonyms or anonymous identifiers
- **Implement data retention policies** - delete old data regularly

### 2. GDPR Compliance

If collecting any personal data:

- Provide clear privacy notices
- Implement data deletion mechanisms
- Allow users to request their data
- Get explicit consent for data collection

### 3. Leaderboard Privacy

- Use anonymous identifiers instead of real names
- Limit leaderboard data retention
- Provide opt-out mechanisms
- Don't collect IP addresses or other identifying information

## Monitoring and Incident Response

### 1. Security Monitoring

- Log all flag submission attempts
- Monitor for unusual patterns (rapid submissions, etc.)
- Set up alerts for security events
- Regular security audits

### 2. Incident Response Plan

- Have a process for handling compromised flags
- Implement emergency flag rotation
- Document security incidents
- Have a communication plan for security issues

## Development Security

### 1. Code Security

- Regular dependency updates
- Use security scanning tools
- Implement proper error handling
- Validate all user inputs

### 2. Access Control

- Limit admin access to necessary personnel
- Use strong authentication for admin functions
- Implement audit logging for admin actions
- Regular access reviews

## Recommended Implementation Steps

1. **Immediate (Current Implementation)**

   - Add client-side rate limiting
   - Implement proper error handling
   - Add input validation

2. **Short-term (Next Release)**

   - Move to serverless flag verification
   - Implement environment variable management
   - Add basic monitoring

3. **Long-term (Production)**
   - Full security audit
   - Implement comprehensive monitoring
   - Add advanced rate limiting
   - Consider professional security review

## Emergency Procedures

### If Flags Are Compromised

1. Immediately rotate all affected flags
2. Update the dataset with new flags
3. Notify participants of the security issue
4. Investigate the source of the compromise
5. Implement additional security measures

### If System Is Under Attack

1. Implement emergency rate limiting
2. Block suspicious IP addresses
3. Monitor for patterns in attacks
4. Consider temporary shutdown if necessary
5. Document all actions taken

## Security Checklist

- [ ] Flags are not stored in plaintext in the repository
- [ ] Environment variables are used for sensitive data
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] Error messages don't leak sensitive information
- [ ] HTTPS is enforced
- [ ] Security headers are implemented
- [ ] Regular security updates are performed
- [ ] Monitoring and logging are in place
- [ ] Incident response procedures are documented

Remember: **Security is an ongoing process, not a one-time implementation.**
