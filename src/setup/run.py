import psycopg2
import json
import bcrypt
import os


def main():
    # Important connection credentials
    creds = {
        'user': 'ogvbpujk',
        'password': 'QVCNvPpXOxSLVxal5WRDKsSU_UhZ24Lq',
        'host': 'kandula.db.elephantsql.com',
        'port': '5432',
        'database': 'ogvbpujk'
    }

    try:
        # Connect to database and set cursor
        connection = psycopg2.connect(user=creds['user'],
                                      password=creds['password'],
                                      host=creds['host'],
                                      port=creds['port'],
                                      database=creds['database'])
        cursor = connection.cursor()
        print(f"Connected to {creds['host']} ElephantSQL database...")


        # Relative path to get and load the data.json
        dirname = os.getcwd()
        filename = f'{dirname}/data.json'
        with open(filename) as f:
            data = json.load(f)
        print(f'Loaded data from file...')


        # Clear all previous records through deleting users as this will cascade
        cursor.execute('''DELETE FROM users WHERE true;''')
        connection.commit()
        print('Deleted all previous records')

        counsellorsN = len(data)

        # Now iterate over each counsellor given in the data.json file
        for i, counsellor in enumerate(data):
            # Show our progress
            print(f'Progress: {str(round(i/counsellorsN, 2)*100)[:4]}%')

            # We create a new encrypted password for each counsellor, but they are all really the string 'password'
            password = bcrypt.hashpw(b'password', bcrypt.gensalt(rounds=10)).decode()


            # Update users tables
            query = "INSERT INTO users VALUES (%s, %s, %s);"
            cursor.execute(query, (counsellor['counsellor_id'], counsellor['first_name'].lower(), counsellor['last_name'].lower()))


            # Update creds table
            query = "INSERT INTO creds VALUES (%s, %s);"
            cursor.execute(query, (counsellor['counsellor_id'], password))


            # Enumerate over the types/mediums of appointments provided and update aptEnum table
            for type in counsellor['appointment_types']:
                for medium in counsellor['appointment_mediums']:
                    query = "INSERT INTO aptEnum VALUES (%s, %s, %s)"
                    cursor.execute(query, (counsellor['counsellor_id'], type.lower(), medium.lower()))


            # Update slots table
            for slot in counsellor['availability']:
                query = "INSERT INTO slots (userid, datetime) VALUES (%s, %s)"
                cursor.execute(query, (counsellor['counsellor_id'], slot['datetime']))

        # Commit the transaction
        connection.commit()


    except (Exception, psycopg2.Error) as error:
        print('Error while connecting to PostgreSQL', error)


    # Close our connections
    finally:
        if (connection):
            cursor.close()
            connection.close()
            print('All records updated!\nPostgreSQL connection is closed')

if __name__ == '__main__':
    main()
