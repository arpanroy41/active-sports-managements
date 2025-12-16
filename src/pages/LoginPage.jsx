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

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
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
              Sign in to manage your tournaments
            </p>
          </div>

          {error && (
            <Alert 
              variant="danger" 
              title="Login failed" 
              style={{ marginBottom: '1rem' }}
            >
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <FormGroup label="Email" isRequired fieldId="email">
              <TextInput
                isRequired
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(_, value) => setEmail(value)}
                autoComplete="email"
              />
            </FormGroup>

            <FormGroup label="Password" isRequired fieldId="password">
              <TextInput
                isRequired
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(_, value) => setPassword(value)}
                autoComplete="current-password"
              />
            </FormGroup>

            <Button
              type="submit"
              variant="primary"
              isBlock
              isDisabled={loading}
              style={{ marginTop: '1rem' }}
            >
              {loading ? <Spinner size="md" /> : 'Sign In'}
            </Button>
          </Form>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p>
              Don&apos;t have an account?{' '}
              <Link to="/signup" style={{ color: '#06c' }}>
                Sign up
              </Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </PageSection>
  );
};

export default LoginPage;

