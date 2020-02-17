pragma solidity >=0.5.10 <0.6.0;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract DappToken {
    using SafeMath for uint256;

     /** State Variables */
    string public name = "DApp Token";
    string public symbol = "DAPP";
    string public standard = "DAPP Token v1.0";
    uint256 public totalSupply;
    address public admin;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping (address => uint256)) public allowance;
    mapping(address => uint256) public freezeOf;

    /** Events */
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event Burn(address indexed from, uint256 value);
    event Freeze(address indexed from, uint256 value);
    event Unfreeze(address indexed from, uint256 value);

    /** Constructor*/
    constructor(uint256 _initialSupply) public {
        require(_initialSupply > 0, "constructor::Supply Error, Total supply should be greator than 0");
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
        admin = msg.sender;
    }

    /** public methods */
    function transfer(address _receiver, uint256 _amount) public returns (bool success){
        require(_amount > 0, "transfer::Amount Error, Amount should be greator than 0");
        require(balanceOf[msg.sender] >= _amount, "transfer::Balance Error, Insufficient balance of sender");
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_amount);
        balanceOf[_receiver] = balanceOf[_receiver].add(_amount);
        emit Transfer(msg.sender, _receiver, _amount);
        return true;
    }

    function approve(address _spender, uint256 _amount) public returns (bool success){
        allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success){
        require(_amount > 0, "transferFrom::Amount Error, Amount should be greator than 0");
        require(_amount <= balanceOf[_from], "transferFrom::Balance Error, Insufficient balance to transfer");
        require(_amount <= allowance[_from][msg.sender], "transferFrom::Allowance Error, Insufficient balance of owner");
        balanceOf[_from] = balanceOf[_from].sub(_amount);
        balanceOf[_to] = balanceOf[_to].add(_amount);
        allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_amount);
        emit Transfer(_from, _to, _amount);
        return true;
    }

    function burn(uint256 _value) public returns (bool success) {
        require(_value > 0, "Burn Amount should be greator than 0");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance for burn");
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        totalSupply = totalSupply.sub(_value);
        emit Burn(msg.sender, _value);
        return true;
    }

    function freeze(uint256 _value) public returns (bool success) {
        require(_value > 0, "Freezing amount should be greator than 0");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance for Freeze");
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        freezeOf[msg.sender] = freezeOf[msg.sender].add(_value);
        emit Freeze(msg.sender, _value);
        return true;
    }

    function unfreeze(uint256 _value) public returns (bool success) {
        require(_value > 0, "Unfrezzing amount should be greator than 0");
        require(freezeOf[msg.sender] >= _value, "Insufficient balance for un freeze");
        balanceOf[msg.sender] = balanceOf[msg.sender].add(_value);
        freezeOf[msg.sender] = freezeOf[msg.sender].sub(_value);
        emit Unfreeze(msg.sender, _value);
        return true;
    }

    function mint(uint _value, address _to) public returns (bool success) {
        require(_value > 0, "Mint amount should be greator than 0");
        require(admin == msg.sender, "Admin should initiate minting");
        totalSupply = totalSupply.add(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}
