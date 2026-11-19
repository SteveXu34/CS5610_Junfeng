
import os
import getpass
import bcrypt
import psycopg2

# Read the database connection URL from the environment variable.
# Avoid hardcoding database credentials in the source code.
DATABASE_URL = os.environ["DATABASE_URL"]


def create_user():
    # Ask the user to enter an email address.
    # strip() removes leading and trailing whitespace.
    # lower() converts the email to lowercase for consistency.
    email = input("Enter email: ").strip().lower()

    # Prompt for a password without displaying it in the terminal.
    password = getpass.getpass("Enter password: ")

    # Make sure both email and password are provided.
    if not email or not password:
        print("Email and password cannot be empty.")
        return

    # Convert the password from a string to bytes using UTF-8.
    # bcrypt requires bytes rather than Python strings.
    password_bytes = password.encode("utf-8")

    # Generate a random salt and hash the password using bcrypt.
    # Never store the original plaintext password in the database.
    password_hash = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    ).decode("utf-8")

    # Connect to the PostgreSQL database using DATABASE_URL.
    # The 'with' statement commits the transaction if successful
    # and rolls it back if an exception occurs.
    with psycopg2.connect(DATABASE_URL) as conn:

        # Create a cursor to execute SQL queries.
        # The cursor is automatically closed after this block.
        with conn.cursor() as cur:

            # Insert the user's email and hashed password.
            # %s placeholders prevent SQL injection by separating
            # SQL code from user-provided values.
            cur.execute(
                """
                INSERT INTO users (email, password_hash)
                VALUES (%s, %s)
                """,
                (email, password_hash)
            )

    # Display a success message after the transaction completes.
    print("User created successfully.")


# Run create_user() only when this file is executed directly.
# Do not run it automatically when imported by another Python file.
if __name__ == "__main__":
    create_user()
