import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  Form,
  FormGroup,
  TextInput,
  Button,
  Alert,
  PageSection,
  Title,
  Spinner,
} from '@patternfly/react-core';
import { useAuth } from '../contexts/AuthContext';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    teamName: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (_, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp(
      formData.email,
      formData.password,
      formData.name,
      formData.teamName || null
    );

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };

  return (
    <PageSection variant="light" isFilled style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '100vh',
    }}>
      <Card style={{ maxWidth: '500px', width: '100%' }}>
        <CardBody>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Title headingLevel="h1" size="2xl">
              🏆 Active Sports Management
            </Title>
            <p style={{ color: '#6a6e73', marginTop: '0.5rem' }}>
              Create your account
            </p>
          </div>

          {error && (
            <Alert 
              variant="danger" 
              title="Sign up failed" 
              style={{ marginBottom: '1rem' }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              variant="success" 
              title="Account created successfully!" 
              style={{ marginBottom: '1rem' }}
            >
              Redirecting to dashboard...
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <FormGroup label="Full Name" isRequired fieldId="name">
              <TextInput
                isRequired
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange('name')}
              />
            </FormGroup>

            <FormGroup label="Email" isRequired fieldId="email">
              <TextInput
                isRequired
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange('email')}
                autoComplete="email"
              />
            </FormGroup>

            <FormGroup 
              label="Team Name" 
              fieldId="teamName"
              helperText="Optional - Your team affiliation"
            >
              <TextInput
                type="text"
                id="teamName"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange('teamName')}
              />
            </FormGroup>

            <FormGroup label="Password" isRequired fieldId="password">
              <TextInput
                isRequired
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange('password')}
                autoComplete="new-password"
              />
            </FormGroup>

            <FormGroup label="Confirm Password" isRequired fieldId="confirmPassword">
              <TextInput
                isRequired
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                autoComplete="new-password"
              />
            </FormGroup>

            <Button
              type="submit"
              variant="primary"
              isBlock
              isDisabled={loading || success}
              style={{ marginTop: '1rem' }}
            >
              {loading ? <Spinner size="md" /> : 'Sign Up'}
            </Button>
          </Form>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#06c' }}>
                Sign in
              </Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </PageSection>
  );
};

export default SignUpPage;

