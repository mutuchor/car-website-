import initializeAuthentication from "../Firebase/firebase.init";
import { getAuth, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, FacebookAuthProvider, signInWithEmailAndPassword, onAuthStateChanged, signOut, TwitterAuthProvider, getIdToken } from "firebase/auth";
import { useState } from "react";
import { useEffect } from "react";
import swal from 'sweetalert';

initializeAuthentication();


const useFirebase = () => {
    const [user, setUser] = useState({})
    const [admin, setAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const googleProvider = new GoogleAuthProvider();
    const facebookProvider = new FacebookAuthProvider();
    const twitterProvider = new TwitterAuthProvider();

    const auth = getAuth();

    const registerUser = (firstName, lastName, email, password, history) => {
        setIsLoading(true);
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const name = firstName + " " + lastName;
                const newUser = { email, displayName: name };
                setUser(newUser);

                //Add user to db
                saveUserToDb(email, name, 'POST');


                // Send name to firebase
                updateProfile(auth.currentUser, {
                    displayName: name
                }).then(() => {
                    history.replace('/');
                }).catch((error) => {

                });

            })
            .catch((error) => {
                // ..
            })
            .finally(() => setIsLoading(false));
    }

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                getIdToken(user)
                    .then(carIdToken => {
                        localStorage.setItem('carIdToken', carIdToken)
                        setUser(user);
                        setIsLoading(false);
                    })


            } else {
                setUser({})
                setIsLoading(false);
            }

        });
    }, [auth])




    const signInWithGoogle = (location, history) => {
        setIsLoading(true);
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                const user = result.user;
                //Add user to db
                saveUserToDb(user.email, user.displayName, 'PUT');

                const destination = location?.state?.from || '/';
                history.replace(destination);

            }).catch((error) => {

            })
            .finally(() => setIsLoading(false));
    }
    const signInWithFacebook = (location, history) => {
        setIsLoading(true);
        signInWithPopup(auth, facebookProvider)
            .then((result) => {
                const user = result.user;

                //Add user to db
                saveUserToDb(user.email, user.displayName, 'PUT');

                const destination = location?.state?.from || '/';
                history.replace(destination);

            }).catch((error) => {

            })
            .finally(() => setIsLoading(false));
    }
    const signInWithTwitter = (location, history) => {
        setIsLoading(true);
        signInWithPopup(auth, twitterProvider)
            .then((result) => {
                const user = result.user;
                //Add user to db
                saveUserToDb(user.email, user.displayName, 'PUT');

                const destination = location?.state?.from || '/';
                history.replace(destination);

            }).catch((error) => {

            })
            .finally(() => setIsLoading(false));
    }


    const loginUser = (email, password, location, history) => {
        setIsLoading(true);
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                //Using location to redirect the user to his/her desired destination if the user was redirected to login page by the system. Doing this to improve the UX of the user.
                const destination = location?.state?.from || '/';
                history.replace(destination);

            })
            .catch((error) => {
                if (error.message === "Firebase: Error (auth/wrong-password).") {
                    swal("Invalid Password!", "Please check your email & password and then try again", "error");
                }
                else if (error.message === "Firebase: Error (auth/user-not-found).") {
                    swal("User Not Found!", "Please check your email & password and then try again", "warning");
                }
            })
            .finally(() => setIsLoading(false));
    }
    const logOut = () => {
        signOut(auth).then(() => {
            // Sign-out successful.
            setUser({});
        }).catch((error) => {
            // An error happened.
        })
            .finally(() => setIsLoading(false));
    }

    //Function to add users to database MONGO DB
    const saveUserToDb = (email, displayName, method) => {
        const user = { email, displayName };
        fetch('http://localhost:5000/users', {
            method: method,
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(user)
        })
            .then()
    }


    //Checking and then setting user admin or not
    useEffect(() => {
        fetch(`http://localhost:5000/users/${user.email}`)
            .then(res => res.json())
            .then(data => setAdmin(data.admin))
    }, [user.email])


    return {
        user,
        admin,
        isLoading,
        registerUser,
        loginUser,
        signInWithGoogle,
        signInWithFacebook,
        signInWithTwitter,
        logOut,
    }
};

export default useFirebase;