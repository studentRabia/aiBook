import React, { useState } from 'react';
import Layout from '@theme/Layout';
import styles from './auth.module.css';

const PROGRAMMING_LANGUAGES = [
  'Python',
  'C++',
  'JavaScript/TypeScript',
  'Rust',
  'Java',
  'Go',
  'MATLAB',
  'Other',
];

const HARDWARE_PLATFORMS = [
  'Arduino',
  'Raspberry Pi',
  'NVIDIA Jetson',
  'ROS-based robots',
  'Industrial robots (ABB, KUKA, etc.)',
  'Humanoid robots',
  'Drones/UAVs',
  'Custom hardware',
  'None yet',
];

const LEARNING_GOALS = [
  'Build autonomous robots',
  'Learn ROS 2',
  'Work with NVIDIA Isaac',
  'Implement AI/ML for robotics',
  'Digital twin development',
  'Vision-Language-Action models',
  'Career in robotics',
  'Academic research',
  'Hobby projects',
];

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Software Background
  const [programmingExperience, setProgrammingExperience] = useState('');
  const [programmingLanguages, setProgrammingLanguages] = useState([]);
  const [softwareBackground, setSoftwareBackground] = useState('');

  // Step 3: Hardware Background
  const [hardwareExperience, setHardwareExperience] = useState('');
  const [roboticsExperience, setRoboticsExperience] = useState('');
  const [hardwarePlatforms, setHardwarePlatforms] = useState([]);

  // Step 4: Learning Goals
  const [learningGoals, setLearningGoals] = useState([]);

  const toggleArrayItem = (array, setArray, item) => {
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const validateStep1 = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!programmingExperience) {
      setError('Please select your programming experience level');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep3 = () => {
    if (!hardwareExperience) {
      setError('Please select your hardware experience level');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const calculatePersonalizedLevel = () => {
    const expLevels = { none: 0, beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const progScore = expLevels[programmingExperience] || 0;
    const hwScore = expLevels[hardwareExperience] || 0;
    const robotScore = expLevels[roboticsExperience] || 0;

    const avgScore = (progScore + hwScore + robotScore) / 3;

    if (avgScore < 1.5) return 'beginner';
    if (avgScore < 2.5) return 'intermediate';
    return 'advanced';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const personalizedLevel = calculatePersonalizedLevel();

      const response = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          programmingExperience,
          programmingLanguages: JSON.stringify(programmingLanguages),
          softwareBackground,
          hardwareExperience,
          roboticsExperience,
          hardwarePlatforms: JSON.stringify(hardwarePlatforms),
          learningGoals: JSON.stringify(learningGoals),
          personalizedLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign up');
      }

      // Redirect to home or dashboard
      window.location.href = '/docs/intro';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className={styles.stepIndicator}>
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={`${styles.step} ${s === step ? styles.active : ''} ${s < step ? styles.completed : ''}`}
        >
          {s < step ? '✓' : s}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className={styles.stepContent}>
      <h2>Create Your Account</h2>
      <p className={styles.stepDescription}>Let's start with your basic information</p>

      <div className={styles.formGroup}>
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password (min 8 characters)"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.stepContent}>
      <h2>Software Background</h2>
      <p className={styles.stepDescription}>Tell us about your programming experience</p>

      <div className={styles.formGroup}>
        <label>Programming Experience Level</label>
        <div className={styles.radioGroup}>
          {['none', 'beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
            <label key={level} className={styles.radioLabel}>
              <input
                type="radio"
                name="programmingExperience"
                value={level}
                checked={programmingExperience === level}
                onChange={(e) => setProgrammingExperience(e.target.value)}
              />
              <span className={styles.radioText}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Programming Languages (select all that apply)</label>
        <div className={styles.checkboxGrid}>
          {PROGRAMMING_LANGUAGES.map((lang) => (
            <label key={lang} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={programmingLanguages.includes(lang)}
                onChange={() => toggleArrayItem(programmingLanguages, setProgrammingLanguages, lang)}
              />
              <span>{lang}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="softwareBackground">Tell us more about your software background (optional)</label>
        <textarea
          id="softwareBackground"
          value={softwareBackground}
          onChange={(e) => setSoftwareBackground(e.target.value)}
          placeholder="E.g., web development, embedded systems, data science, etc."
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className={styles.stepContent}>
      <h2>Hardware Background</h2>
      <p className={styles.stepDescription}>Tell us about your hardware and robotics experience</p>

      <div className={styles.formGroup}>
        <label>Hardware Experience Level</label>
        <div className={styles.radioGroup}>
          {['none', 'beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
            <label key={level} className={styles.radioLabel}>
              <input
                type="radio"
                name="hardwareExperience"
                value={level}
                checked={hardwareExperience === level}
                onChange={(e) => setHardwareExperience(e.target.value)}
              />
              <span className={styles.radioText}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Robotics Experience Level</label>
        <div className={styles.radioGroup}>
          {['none', 'beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
            <label key={level} className={styles.radioLabel}>
              <input
                type="radio"
                name="roboticsExperience"
                value={level}
                checked={roboticsExperience === level}
                onChange={(e) => setRoboticsExperience(e.target.value)}
              />
              <span className={styles.radioText}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Hardware Platforms (select all you have used)</label>
        <div className={styles.checkboxGrid}>
          {HARDWARE_PLATFORMS.map((platform) => (
            <label key={platform} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={hardwarePlatforms.includes(platform)}
                onChange={() => toggleArrayItem(hardwarePlatforms, setHardwarePlatforms, platform)}
              />
              <span>{platform}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className={styles.stepContent}>
      <h2>Learning Goals</h2>
      <p className={styles.stepDescription}>What do you want to achieve with this textbook?</p>

      <div className={styles.formGroup}>
        <label>Select your learning goals (select all that apply)</label>
        <div className={styles.checkboxGrid}>
          {LEARNING_GOALS.map((goal) => (
            <label key={goal} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={learningGoals.includes(goal)}
                onChange={() => toggleArrayItem(learningGoals, setLearningGoals, goal)}
              />
              <span>{goal}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.summaryBox}>
        <h3>Your Profile Summary</h3>
        <p><strong>Experience Level:</strong> {calculatePersonalizedLevel()}</p>
        <p><strong>Programming:</strong> {programmingExperience || 'Not specified'}</p>
        <p><strong>Hardware:</strong> {hardwareExperience || 'Not specified'}</p>
        <p><strong>Robotics:</strong> {roboticsExperience || 'Not specified'}</p>
      </div>
    </div>
  );

  return (
    <Layout title="Sign Up" description="Create your account">
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1 className={styles.title}>Join the Robotics Journey</h1>

          {renderStepIndicator()}

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            <div className={styles.buttonGroup}>
              {step > 1 && (
                <button type="button" onClick={handleBack} className={styles.backButton}>
                  Back
                </button>
              )}

              {step < 4 ? (
                <button type="button" onClick={handleNext} className={styles.nextButton}>
                  Next
                </button>
              ) : (
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>
          </form>

          <p className={styles.switchAuth}>
            Already have an account? <a href="/signin">Sign In</a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
