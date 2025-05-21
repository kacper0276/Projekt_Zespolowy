export const getActivationEmailTemplate = (activationLink: string): string => `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Potwierdzenie rejestracji</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            color: #333;
        }

        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }

        .email-container:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .email-header {
            background: linear-gradient(90deg, #080078, #be0533);
            color: #ffffff;
            text-align: center;
            padding: 20px;
            font-size: 24px;
        }

        .email-body {
            padding: 20px;
        }

        .email-body p {
            margin: 0 0 15px;
            line-height: 1.6;
        }

        .email-body a {
            display: inline-block;
            background: linear-gradient(90deg, #080078, #be0533);
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            font-size: 16px;
            margin-top: 10px;
            transition: background 0.3s ease, transform 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .email-body a:hover {
            background: linear-gradient(90deg, #080078, #be0533);
            transform: translateY(-3px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }

        .email-footer {
            background-color: #f1f1f1;
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #665;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            Potwierdzenie rejestracji
        </div>
        <div class="email-body">
            <p>Witaj, </p>
            <p>Dziękujemy za rejestrację na naszej platformie. Aby aktywować swoje konto, kliknij poniższy przycisk:</p>
            <p>
                <a href="${activationLink}" target="_blank">Aktywuj konto</a>
            </p>
            <p>Jeśli nie rejestrowałeś/aś się w naszym serwisie, zignoruj tę wiadomość.</p>
        </div>
        <div class="email-footer">
            &copy; 2025 Serwis. Wszelkie prawa zastrzeżone.
        </div>
    </div>
</body>
</html>
`;
