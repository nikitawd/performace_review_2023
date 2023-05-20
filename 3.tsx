const ProfileCard = ({ userId }) => {
  const [comment, setComment] = useState("");

  // TODO: reset comment when change to another ProfileCard

  return (
    <View>
      <Title>Leave your comment for user{userId}</Title>

      <TextInput title="Your comment" value={comment} onChange={setComment} />
    </View>
  );
};
